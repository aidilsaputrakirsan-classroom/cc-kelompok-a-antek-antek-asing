"""
Integration test: komunikasi Item Service -> Auth Service via auth_client.py.

Mensimulasikan skenario antar-service (Minggu 13 — Reliability & Resilience):
  - Auth Service merespons normal (200) -> token diverifikasi.
  - Auth Service menolak token (401) -> diteruskan apa adanya, TANPA retry.
  - Auth Service gagal sementara (503/timeout) -> di-retry dengan exponential
    backoff, lalu berhasil di percobaan berikutnya.
  - Auth Service gagal terus-menerus -> circuit breaker OPEN, request
    berikutnya fail-fast tanpa memanggil Auth Service sama sekali.
  - Setelah cooldown circuit breaker lewat -> HALF_OPEN, berhasil -> CLOSED lagi.

httpx di-mock dengan `respx` supaya tidak butuh Auth Service yang benar-benar
jalan — ini tetap "integration test" pada level kontrak HTTP antar service,
bukan unit test murni terhadap satu fungsi.
"""
import time

import httpx
import pytest
import respx

import auth_client
from config import settings

VERIFY_URL = f"{settings.AUTH_SERVICE_URL}/verify"


class FakeState:
    def __init__(self, correlation_id="test-correlation-id"):
        self.correlation_id = correlation_id


class FakeRequest:
    def __init__(self, correlation_id="test-correlation-id"):
        self.state = FakeState(correlation_id)


@pytest.fixture(autouse=True)
def reset_circuit_breaker():
    """Setiap test mulai dari circuit breaker CLOSED & bersih."""
    auth_client._circuit_breaker.record_success()
    yield
    auth_client._circuit_breaker.record_success()


@pytest.fixture(autouse=True)
def fast_backoff(monkeypatch):
    """Backoff sangat kecil saat test, supaya test retry tidak lambat."""
    monkeypatch.setattr(auth_client, "BACKOFF_BASE_SECONDS", 0.001)


@respx.mock
async def test_verify_success_returns_user_data():
    respx.get(VERIFY_URL).mock(
        return_value=httpx.Response(200, json={"id": 1, "email": "a@b.com", "role": "employee"})
    )

    user = await auth_client.get_current_user(FakeRequest(), token="valid-token")

    assert user["id"] == 1
    assert auth_client._circuit_breaker.state == "CLOSED"


@respx.mock
async def test_verify_invalid_token_is_not_retried():
    route = respx.get(VERIFY_URL).mock(
        return_value=httpx.Response(401, json={"detail": "Token tidak valid"})
    )

    with pytest.raises(Exception) as exc_info:
        await auth_client.get_current_user(FakeRequest(), token="bad-token")

    assert exc_info.value.status_code == 401
    # Hanya 1 kali dipanggil — 401 tidak boleh di-retry.
    assert route.call_count == 1


@respx.mock
async def test_verify_retries_on_503_then_succeeds():
    route = respx.get(VERIFY_URL).mock(
        side_effect=[
            httpx.Response(503),
            httpx.Response(503),
            httpx.Response(200, json={"id": 2, "email": "c@d.com", "role": "it_employee"}),
        ]
    )

    user = await auth_client.get_current_user(FakeRequest(), token="valid-token")

    assert user["id"] == 2
    assert route.call_count == 3  # 2 gagal + 1 berhasil


@respx.mock
async def test_verify_exhausts_retries_returns_503():
    route = respx.get(VERIFY_URL).mock(return_value=httpx.Response(503))

    with pytest.raises(Exception) as exc_info:
        await auth_client.get_current_user(FakeRequest(), token="valid-token")

    assert exc_info.value.status_code == 503
    assert route.call_count == auth_client.MAX_RETRIES


@respx.mock
async def test_circuit_breaker_opens_after_threshold_failures():
    respx.get(VERIFY_URL).mock(side_effect=httpx.ConnectError("connection refused"))

    threshold = auth_client._circuit_breaker.failure_threshold

    # Tiap request gagal MAX_RETRIES kali sebelum dihitung 1 failure oleh
    # circuit breaker -> habiskan threshold dengan memanggil get_current_user
    # berkali-kali (masing-masing 1 failure tercatat).
    for _ in range(threshold):
        with pytest.raises(Exception):
            await auth_client.get_current_user(FakeRequest(), token="valid-token")

    assert auth_client._circuit_breaker.state == "OPEN"

    calls_before = len(respx.calls)

    # Request selanjutnya harus fail-fast (503) TANPA memanggil Auth Service.
    with pytest.raises(Exception) as exc_info:
        await auth_client.get_current_user(FakeRequest(), token="valid-token")

    assert exc_info.value.status_code == 503
    assert len(respx.calls) == calls_before  # tidak ada HTTP call tambahan


@respx.mock
async def test_circuit_breaker_recovers_after_cooldown():
    respx.get(VERIFY_URL).mock(side_effect=httpx.ConnectError("connection refused"))

    # Buka circuit breaker secara langsung (tanpa perlu retry loop penuh).
    for _ in range(auth_client._circuit_breaker.failure_threshold):
        auth_client._circuit_breaker.record_failure()
    assert auth_client._circuit_breaker.state == "OPEN"

    # Simulasikan waktu cooldown sudah lewat tanpa benar-benar menunggu.
    auth_client._circuit_breaker.opened_at = time.monotonic() - (
        auth_client._circuit_breaker.recovery_seconds + 1
    )

    # Ganti mock jadi sukses untuk trial HALF_OPEN.
    respx.get(VERIFY_URL).mock(
        return_value=httpx.Response(200, json={"id": 3, "email": "e@f.com", "role": "admin"})
    )

    user = await auth_client.get_current_user(FakeRequest(), token="valid-token")

    assert user["id"] == 3
    assert auth_client._circuit_breaker.state == "CLOSED"
