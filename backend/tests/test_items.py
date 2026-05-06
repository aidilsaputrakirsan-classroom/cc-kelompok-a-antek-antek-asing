"""Test CRUD item endpoints.

NOTE: Aplikasi ini sebenarnya sudah berevolusi menjadi sistem Ticketing,
bukan Item CRUD lagi. Endpoint /items mungkin sudah tidak ada.
Test ini menggunakan endpoint /tickets yang sesuai dengan main.py saat ini.
"""


def test_create_ticket(client, auth_headers, db_session):
    """Test membuat tiket baru → 201."""
    # Pastikan ada kategori dulu (di-seed oleh lifespan)
    from models import Category
    cat = db_session.query(Category).first()
    assert cat is not None, "Kategori harus sudah di-seed oleh lifespan"

    response = client.post("/tickets", json={
        "title": "Laptop Rusak",
        "description": "Laptop tidak bisa menyala sejak pagi",
        "priority": "high",
        "category_id": cat.id
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Laptop Rusak"
    assert "id" in data


def test_create_ticket_unauthorized(client):
    """Test membuat tiket tanpa login → 401."""
    response = client.post("/tickets", json={
        "title": "Laptop Rusak",
        "description": "Tidak bisa menyala",
        "priority": "low",
        "category_id": 1
    })
    assert response.status_code == 401


def test_get_tickets(client, auth_headers, db_session):
    """Test mengambil daftar tiket → 200."""
    from models import Category
    cat = db_session.query(Category).first()

    # Buat 2 tiket
    client.post("/tickets", json={
        "title": "Laptop Rusak", "description": "Desc 1",
        "priority": "low", "category_id": cat.id
    }, headers=auth_headers)
    client.post("/tickets", json={
        "title": "Mouse Error", "description": "Desc 2",
        "priority": "medium", "category_id": cat.id
    }, headers=auth_headers)

    response = client.get("/tickets", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2


def test_get_ticket_not_found(client, auth_headers):
    """Test mengambil tiket yang tidak ada → 404."""
    response = client.get("/tickets/9999", headers=auth_headers)
    assert response.status_code == 404


def test_delete_ticket(client, auth_headers, db_session):
    """Test hapus tiket → 204, lalu GET → 404."""
    from models import Category
    cat = db_session.query(Category).first()

    # Buat tiket
    create_resp = client.post("/tickets", json={
        "title": "Temporary Ticket", "description": "To be deleted",
        "priority": "low", "category_id": cat.id
    }, headers=auth_headers)
    ticket_id = create_resp.json()["id"]

    # Hapus (admin/superadmin only)
    response = client.delete(f"/tickets/{ticket_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verifikasi sudah tidak ada
    get_resp = client.get(f"/tickets/{ticket_id}", headers=auth_headers)
    assert get_resp.status_code == 404