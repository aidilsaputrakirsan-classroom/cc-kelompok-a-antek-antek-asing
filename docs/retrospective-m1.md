# Retrospective — Milestone 1

# 🟢 Apa yang Berjalan Baik?

## 1. Setup Project & Environment
- Docker Compose berhasil dijalankan untuk backend, frontend, dan database.
- Struktur project sudah terpisah dengan jelas (backend & frontend).
- Integrasi antara FastAPI, React, dan PostgreSQL berjalan dengan baik.

## 2. Fitur Utama Berhasil Diimplementasikan
- Authentication (Register & Login) menggunakan JWT sudah berjalan.
- CRUD Ticket (Create, Read, Update, Delete) berhasil dibuat.
- Dashboard untuk masing-masing role sudah tersedia.
- Sistem role-based (superadmin, admin, it_employee, employee) sudah diterapkan.

## 3. API Documentation
- Swagger UI (`/docs`) tersedia dan bisa digunakan untuk testing endpoint.
- Endpoint backend cukup lengkap dan terstruktur.


---
<br>

# 🔴 Apa yang Perlu Diperbaiki? 
<br>

- Fitur forgot password belum tersedia (backend).
- Fitur change password belum tersedia (backend).
- Approval user (pending user) belum tersedia di frontend (hanya backend).
- Belum ada notifikasi real-time.
- Beberapa fitur hanya tersedia di UI tetapi belum terhubung ke backend.
- `SECRET_KEY` masih menggunakan fallback (risk tinggi).
- Token disimpan di `localStorage` (rentan XSS).
- Tidak ada rate limiting pada login (rentan brute force).
- Credential masih ada di file `.env` yang ter-commit.
- Testing masih manual dan belum terdokumentasi dengan rapi di awal.

---
<br>

# 🔵 Action Items untuk Milestone 2

- Change Password (backend + frontend)
- Forgot Password
- Approval user di frontend
- Notifikasi (minimal basic)
- Sinkronisasi fitur frontend dan backend
- Membuat dokumentasi testing 
- Menyusun test case berdasarkan

---

# 📊 Kontribusi Tim

| Anggota | Kontribusi Utama | Jumlah Commit |
|----------|------------------|----------------|
| Muhammad Athala Romero | Backend (Auth, Ticket API) | 26 |
| Muhammad Bagas Setiawan | Frontend (Dashboard, UI) | 29 |
| Muhammad Fikri Haikal Ariadma | Database & Integration | 27|
| Nanda Aulia Putri | QA & Dokumentasi | 13|


