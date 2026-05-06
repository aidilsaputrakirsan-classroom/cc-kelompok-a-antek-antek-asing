"""
Konfigurasi test — setup database test terpisah dari database utama.

PENTING: Kita HARUS monkey-patch modul `database` SEBELUM `main` di-import,
agar lifespan() dan semua endpoint menggunakan SQLite test DB,
bukan PostgreSQL Docker (host 'db' yang tidak tersedia di lokal).
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# === STEP 1: Buat test engine SQLite SEBELUM import main ===
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# === STEP 2: Monkey-patch modul database SEBELUM main.py di-import ===
import database
database.engine = test_engine
database.SessionLocal = TestingSessionLocal

# Override get_db supaya default-nya pakai TestingSessionLocal
def _test_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

database.get_db = _test_get_db

# === STEP 3: Set environment variable untuk config (supaya tidak error) ===
os.environ.setdefault("DATABASE_URL", SQLALCHEMY_TEST_DATABASE_URL)

# === STEP 4: SEKARANG baru aman import main ===
from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

# === STEP 5: Disable rate limiter saat testing ===
# Tanpa ini, test akan gagal dengan 429 Too Many Requests
# Langsung disable limiter yang sudah dibuat di main.py
app.state.limiter.enabled = False
app.state.limiter._enabled = False

@pytest.fixture(scope="function")
def db_session():
    """Buat tabel baru untuk setiap test, lalu hapus setelahnya."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Test client dengan database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db_session):
    """Helper: login sebagai superadmin (sudah di-seed oleh lifespan, status ACTIVE).
    
    Superadmin dibuat dengan must_change_password=True di lifespan.
    Kita perlu set must_change_password=False agar bisa akses endpoint protected.
    """
    from models import User
    
    # Update superadmin must_change_password → False supaya bisa akses endpoint
    sa = db_session.query(User).filter(User.email == "superadmin@admin.com").first()
    if sa:
        sa.must_change_password = False
        db_session.commit()
    
    # Login sebagai superadmin — sudah tersedia dari lifespan seeding
    # Endpoint login menggunakan OAuth2PasswordRequestForm (form data, field 'username')
    response = client.post("/auth/login", data={
        "username": "superadmin@admin.com",
        "password": "KatasandiKuatBaru123!"
    })
    assert response.status_code == 200, f"Superadmin login failed: {response.json()}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}