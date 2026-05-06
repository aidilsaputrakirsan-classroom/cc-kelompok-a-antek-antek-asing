"""Test authentication endpoints."""


def test_register_success(client):
    """Test register user baru berhasil."""
    response = client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "SecurePass123!",
        "name": "New User"
    })
    assert response.status_code == 201
    data = response.json()
    # RegisterResponse = { "user": UserResponse, "message": str }
    assert "user" in data
    assert "message" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["name"] == "New User"
    assert "id" in data["user"]
    # Password TIDAK boleh ada di response
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]


def test_register_duplicate_email(client):
    """Test register dengan email yang sudah ada → 400."""
    # Register pertama
    client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "Pass123!abc",
        "name": "User 1"
    })
    # Register kedua dengan email sama
    response = client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "Pass456!abc",
        "name": "User 2"
    })
    assert response.status_code == 400


def test_login_success(client, db_session):
    """Test login dengan kredensial benar → return token.
    
    Karena user yang baru register berstatus PENDING (tidak bisa login),
    kita langsung login menggunakan superadmin yang sudah di-seed oleh lifespan.
    """
    # Login pakai superadmin (sudah di-seed oleh lifespan, status ACTIVE)
    # Endpoint login menggunakan OAuth2PasswordRequestForm (form data, field 'username')
    response = client.post("/auth/login", data={
        "username": "superadmin@admin.com",
        "password": "KatasandiKuatBaru123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login dengan password salah → 401."""
    response = client.post("/auth/login", data={
        "username": "superadmin@admin.com",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401


def test_login_pending_user_rejected(client):
    """Test login user PENDING → 403 (account awaiting approval)."""
    # Register (status akan PENDING)
    client.post("/auth/register", json={
        "email": "pending@example.com",
        "password": "PendingPass123!",
        "name": "Pending User"
    })
    # Coba login — harus ditolak karena masih PENDING
    response = client.post("/auth/login", data={
        "username": "pending@example.com",
        "password": "PendingPass123!"
    })
    assert response.status_code == 403