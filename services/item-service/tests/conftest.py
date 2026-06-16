"""
Pytest config untuk item-service tests.

PENTING: `config.py` (pydantic-settings) butuh `DATABASE_URL` saat import,
dan `auth_client.py` membaca `AUTH_SERVICE_URL` saat modul di-load (untuk
`oauth2_scheme`). Set env var ini SEBELUM modul mana pun di-import supaya
tidak gagal validasi dan supaya integration test bisa mock URL yang
predictable, terlepas dari isi .env lokal.
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_item_service.db")
os.environ.setdefault("AUTH_SERVICE_URL", "http://auth-service-test:8001")
