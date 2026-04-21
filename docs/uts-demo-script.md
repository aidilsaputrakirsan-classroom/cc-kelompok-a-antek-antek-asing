# 🧪 UTS Demo Script – CC Kelompok A




## 1. 🖥️ Live Demo (±10 Menit)

### ⏱️ Menit 0–1 — Menjalankan Aplikasi (DevOps)

> Pada tahap awal, kami menjalankan seluruh sistem menggunakan Docker Compose.

**Perintah:**

docker compose up -d
docker compose ps

Yang ditunjukkan:

Terdapat 3 services aktif:
database (PostgreSQL)
backend (FastAPI)
frontend (React/Vite)
Status semua container: Up
Database status: healthy
⏱️ Menit 1–3 — Authentication (Frontend)

Buka:

http://localhost:3000

Demo:

Register user baru
Validasi email & password
Login menggunakan user tersebut

Menunjukkan:

User berhasil login
Akses dashboard berhasil

Poin penting:

- Endpoint tidak bisa diakses tanpa login
- JWT authentication berjalan

⏱️ Menit 3–6 — Demo CRUD Ticket (Frontend + Backend)
- CREATE

Employee membuat tiket baru
Isi form ticket (judul, deskripsi, kategori)

- READ

Tampilkan daftar tiket
Fitur search berjalan
- UPDATE

Edit tiket yang sudah dibuat
Data berubah secara real-time

- DELETE
 
 Hapus tiket
Muncul confirm dialog sebelum delete

## ⏱️ Menit 6–7 — API Backend (Swagger)

## Buka:

http://localhost:8000/docs

untuk menunjukkan: 

Endpoint auth
Endpoint ticket CRUD
Response API (200, 201, 404, dll)

## ⏱️ Menit 7–8 — Data Persistence (DevOps)

Perintah:

docker compose down
docker compose up -d

Setelah itu:

Login kembali

Tunjukkan:

Data tiket masih ada
User masih terdaftar

Penjelasan:

Data tersimpan menggunakan Docker Volume
Database PostgreSQL tidak hilang meskipun container restart

## ⏱️ Menit 8–10 — Code Walkthrough (Arsitektur)
1. docker-compose.yml

Menjelaskan:

- services (backend, frontend, db)
- depends_on
- healthcheck
- networks
- volumes

2. Backend (FastAPI)

Menjelaskan:

- main.py → entry point API
- models.py → struktur database
- crud.py → logic database
- schemas.py → validasi request
- Auth (JWT + hashing password)

3. Frontend (React)

Menjelaskan:

- component-based architecture
- useState & useEffect
- fetch API ke backend
- routing halaman login/dashboard

4. Dockerfile

Menjelaskan:

- Backend Dockerfile → Python image + dependencies
- Frontend Dockerfile → multi-stage build + Nginx
- Konsep image layering & caching

## Code Walkthrough (±5 Menit Tambahan)
🧩 docker-compose.yml

Menunjukkan:

Backend service
Frontend service
Database service
Volume persistence


🧩 Dockerfile Backend

Menjelaskan:

Install dependencies
Copy source code
Run uvicorn


🧩 Dockerfile Frontend

Menjelaskan:

Build React app
Serve via Nginx
Multi-stage build concept