"""
Item Service — Auth Client (Inter-Service Communication).

This module handles authentication by calling the Auth Service's
GET /verify endpoint over HTTP. It acts as a FastAPI dependency
(Depends) to protect Item Service endpoints.

Flow:
  1. Extract Bearer token from the incoming request header.
  2. Forward the token to Auth Service: GET {AUTH_SERVICE_URL}/verify
     with retry + exponential backoff for transient failures, and a
     circuit breaker that fails fast once Auth Service looks down.
  3. If Auth Service returns 200, parse the user data and return it.
  4. If Auth Service returns 4xx, raise HTTPException to reject the request.

This pattern ensures that the Item Service NEVER handles JWT secrets
directly — all token validation is delegated to the Auth Service,
following the Single Responsibility Principle of microservices.
"""

import asyncio
import time
import httpx
import logging
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer

from config import settings

logger = logging.getLogger(__name__)

# Points to Auth Service's /login for Swagger UI compatibility,
# but actual token validation goes through /verify.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.AUTH_SERVICE_URL}/login")

# ── Retry policy ─────────────────────────────────────────────────
# Only retry on transient failures (connection error, timeout, 5xx).
# A 401/403 means the token itself is rejected — retrying won't make
# a wrong token correct, so those are never retried.
MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 1.0  # delay sequence: 1s, 2s (exponential: base * 2^attempt)
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}


# ── Circuit breaker ──────────────────────────────────────────────
class CircuitBreaker:
    """
    In-memory circuit breaker guarding calls to Auth Service.

    States:
      CLOSED    - normal operation, requests pass through.
      OPEN      - too many recent failures; requests fail fast without
                  calling Auth Service at all, until the cooldown elapses.
      HALF_OPEN - cooldown elapsed; allow exactly one trial request.
                  Success -> CLOSED, failure -> OPEN again.
    """

    def __init__(self, failure_threshold: int = 5, recovery_seconds: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_seconds = recovery_seconds
        self.failure_count = 0
        self.state = "CLOSED"
        self.opened_at: float | None = None

    def allow_request(self) -> bool:
        if self.state == "OPEN":
            if time.monotonic() - self.opened_at >= self.recovery_seconds:
                self.state = "HALF_OPEN"
                return True
            return False
        return True

    def record_success(self) -> None:
        self.failure_count = 0
        self.state = "CLOSED"
        self.opened_at = None

    def record_failure(self) -> None:
        self.failure_count += 1
        if self.state == "HALF_OPEN" or self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            self.opened_at = time.monotonic()


_circuit_breaker = CircuitBreaker()


async def _call_verify_with_retry(token: str, correlation_id: str) -> httpx.Response:
    """
    Calls Auth Service's GET /verify with retry + exponential backoff
    for transient failures (timeout, connection error, 5xx).

    Raises the last connection/timeout exception if every attempt fails
    that way. Returns the last response otherwise (including a final
    5xx if retries were exhausted) so the caller can decide how to react.
    """
    last_exc: Exception | None = None
    last_response: httpx.Response | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.AUTH_SERVICE_URL}/verify",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "X-Correlation-ID": correlation_id,
                    },
                    timeout=5.0,
                )
        except (httpx.ConnectError, httpx.TimeoutException) as exc:
            last_exc = exc
            last_response = None
            logger.warning(
                f"Auth Service call failed on attempt {attempt}/{MAX_RETRIES}: {exc}",
                extra={"correlation_id": correlation_id},
            )
        else:
            last_exc = None
            last_response = response
            if response.status_code not in RETRYABLE_STATUS_CODES:
                return response
            logger.warning(
                f"Auth Service returned {response.status_code} on attempt {attempt}/{MAX_RETRIES}",
                extra={"correlation_id": correlation_id},
            )

        if attempt < MAX_RETRIES:
            delay = BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))  # 1s, 2s, 4s...
            await asyncio.sleep(delay)

    if last_exc is not None:
        raise last_exc
    return last_response


async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI dependency that verifies the user's Bearer token
    by calling the Auth Service's /verify endpoint.

    Returns:
        dict: User data from Auth Service (id, email, name, role).

    Raises:
        HTTPException 401: If token is invalid or Auth Service rejects it.
        HTTPException 503: If Auth Service is unreachable, timing out, or
                            the circuit breaker is currently OPEN.
    """
    correlation_id = getattr(request.state, "correlation_id", "unknown")

    if not _circuit_breaker.allow_request():
        logger.error(
            "Circuit breaker OPEN — skipping Auth Service call",
            extra={"correlation_id": correlation_id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth Service sedang bermasalah. Silakan coba lagi sebentar lagi.",
        )

    logger.info("Calling Auth Service for token verification", extra={"correlation_id": correlation_id})

    try:
        response = await _call_verify_with_retry(token, correlation_id)
    except httpx.ConnectError:
        _circuit_breaker.record_failure()
        logger.error("Auth Service connection error", extra={"correlation_id": correlation_id})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth Service tidak dapat dihubungi. Silakan coba lagi nanti.",
        )
    except httpx.TimeoutException:
        _circuit_breaker.record_failure()
        logger.error("Auth Service timeout", extra={"correlation_id": correlation_id})
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Auth Service timeout. Silakan coba lagi nanti.",
        )

    if response.status_code == 200:
        _circuit_breaker.record_success()
        logger.info("Auth Service token verified successfully", extra={"correlation_id": correlation_id})
        return response.json()

    if response.status_code in RETRYABLE_STATUS_CODES:
        # Auth Service itself is unhealthy (5xx) even after retries — this is
        # a service failure, not a bad token, so report it as such.
        _circuit_breaker.record_failure()
        logger.error(
            f"Auth Service failed with {response.status_code} after retries",
            extra={"correlation_id": correlation_id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth Service sedang bermasalah. Silakan coba lagi nanti.",
        )

    # Genuine 4xx rejection (e.g. 401 invalid/expired token) — forward as-is.
    detail = "Token tidak valid"
    try:
        detail = response.json().get("detail", detail)
    except Exception:
        pass

    logger.warning(f"Auth Service rejected token: {detail}", extra={"correlation_id": correlation_id})
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
