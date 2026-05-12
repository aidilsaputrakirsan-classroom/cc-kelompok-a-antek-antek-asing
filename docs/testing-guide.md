# Testing Guide — Antick Async Project

Dokumen ini berisi panduan testing pada project **Antick Async**, meliputi:
- Cara menjalankan testing backend dan frontend secara lokal
- Cara membaca log CI (Continuous Integration)
- Cara melakukan debugging ketika test gagal
- Cara menambahkan test baru
- Struktur testing yang digunakan pada project

Testing dilakukan untuk memastikan bahwa fitur aplikasi berjalan dengan benar, stabil, dan aman sebelum kode di-merge ke branch `main`.

---

#  Tujuan Testing
- Memastikan endpoint API berjalan sesuai fungsi
- Memastikan authentication JWT berjalan dengan baik
- Memastikan sistem role-based access bekerja sesuai hak akses
- Memastikan fitur CRUD ticket berjalan normal
- Mengurangi kemungkinan bug saat deployment
- Memvalidasi perubahan kode sebelum merge
- Menjaga kualitas software secara konsisten

---
<br>

# Jenis Testing yang Digunakan

| Jenis Test | Fungsi | Tools |
|---|---|---|
| Unit Test | Menguji fungsi/komponen secara terisolasi | pytest, Vitest |
| Integration Test | Menguji interaksi antar komponen | FastAPI TestClient |
| UI Component Test | Menguji tampilan dan interaksi React | Testing Library |
| API Testing | Menguji endpoint backend | Swagger, pytest |
| CI Testing | Menjalankan test otomatis di GitHub Actions | GitHub Actions |

---
<br>

#  Backend Testing (FastAPI + Pytest)

## Struktur Testing Backend

```bash
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_items.py
│   └── test_health.py
│
├── pytest.ini
└── requirements.txt
```

---

# Dependencies Backend Testing

Dependencies testing backend terdapat pada:

```bash
backend/requirements.txt
```

Testing menggunakan:

- pytest
- pytest-cov
- httpx

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

---

<br>

#  Cara Menjalankan Test Backend

Masuk ke folder backend

```bash
cd backend
```

Menjalankan semua test

```bash
pytest
```

Menjalankan test dengan coverage

```bash
pytest --cov=. --cov-report=term-missing
```

 Menjalankan file test tertentu

```bash
pytest tests/test_auth.py
```

Menjalankan satu test spesifik

```bash
pytest tests/test_auth.py::test_login_success
```
<br>

# Contoh Output Test Backend

```bash
tests/test_auth.py::test_register_success PASSED
tests/test_auth.py::test_login_success PASSED
tests/test_items.py::test_create_item PASSED

================ 10 passed in 2.10s ================
```

---

# Penjelasan File Testing Backend

## conftest.py

File ini digunakan untuk:

- Setup database testing
- Membuat test client
- Override dependency database
- Membuat authentication helper

Testing menggunakan SQLite sementara (test.db) agar:

- Lebih cepat
- Tidak mengganggu database utama
- Tidak membutuhkan PostgreSQL saat testing

---

##  test_auth.py

Digunakan untuk menguji fitur authentication:

- Register user
- Login user
- Validasi password salah
- Validasi duplicate email
- JWT token validation

---

## test_items.py

Digunakan untuk menguji fitur CRUD item:

- Create item
- Read item
- Update item
- Delete item
- Search item

---

## test_health.py

Digunakan untuk menguji endpoint:

```bash
GET /health
```

Endpoint harus mengembalikan status healthy.

---
<br>

# 🔐 Authentication & Role Testing

Project memiliki beberapa role utama:

| Role | Hak Akses |
|---|---|
| Superadmin | Full akses seluruh sistem |
| Admin | Kelola user dan ticket |
| IT Employee | Menangani ticket IT |
| Employee | Membuat dan melihat ticket pribadi |


---
<br> 

# ⚛️ Frontend Testing (React + Vitest)

##  Struktur Testing Frontend

```bash
frontend/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── Header.test.jsx
│   │       └── ItemCard.test.jsx
│   │
│   └── test/
│       ├── setup.js
│       └── api.test.js
```

<br>


#  Dependencies Frontend Testing

Frontend testing menggunakan:

- Vitest
- Testing Library React
- jsdom

Install dependencies:

```bash
cd frontend
npm install
```

<br>

# Cara Menjalankan Test Frontend

 Masuk ke folder frontend

```bash
cd frontend
```

Menjalankan semua test

```bash
npm test
```

Mode watch

```bash
npm run test:watch
```

Testing coverage

```bash
npm run test:coverage
```

<br>

# Contoh Output Test Frontend

```bash
✓ Header.test.jsx (2 tests)
✓ ItemCard.test.jsx (3 tests)
✓ api.test.js (2 tests)

Test Files 3 passed
Tests 7 passed
```

<br>

# Penjelasan Testing Frontend

## Header.test.jsx

Menguji:

- Judul aplikasi muncul
- Total items tampil dengan benar



## ItemCard.test.jsx

Menguji:

- Informasi item tampil
- Tombol edit berjalan
- Tombol delete berjalan


## api.test.js

Menguji:

- API request berhasil
- Error handling berjalan saat API gagal


# Continuous Integration (CI)

Project menggunakan GitHub Actions untuk menjalankan testing otomatis.

File workflow:

```bash
.github/workflows/ci.yml
```

<br>

# Alur CI Pipeline

```text
Push / Pull Request
        ↓
GitHub Actions Triggered
        ↓
Test Backend
        ↓
Test Frontend
        ↓
Build Docker Images
        ↓
CI Status: PASS / FAIL
```

---

# Jobs pada CI Pipeline

| Job | Fungsi |
|---|---|
| Test Backend | Menjalankan pytest |
| Test Frontend | Menjalankan Vitest |
| Build Docker | Build Docker image |

<br>

# Cara Membaca CI Log

1. Buka repository GitHub
2. Klik tab `Actions`
3. Pilih workflow yang gagal
4. Klik job yang gagal
5. Expand step berwarna merah ❌
6. Baca pesan error

---

# Contoh Error CI

## Backend Error

```bash
ModuleNotFoundError: No module named 'httpx'
```


## Frontend Error

```bash
npm ERR! Missing package
```

---

## Docker Build Error

```bash
COPY failed: file not found
```

<br>

#  Cara Debug Test Failure

## 1. Jalankan Test Lokal

Selalu jalankan test di lokal sebelum push:

```bash
pytest
npm test
```


## 2. Baca Assertion Error

Contoh:

```bash
AssertionError: expected 200 but got 404
```

Artinya endpoint tidak ditemukan atau route salah.



## 3. Periksa Response API

Tambahkan print debugging:

```python
print(response.json())
```


## 4. Periksa Environment Variables

Pastikan file `.env` sesuai konfigurasi.


## 5. Periksa Dependency

Pastikan semua dependency sudah di-install:

```bash
pip install -r requirements.txt
npm install
```

<br>

# 📋 Best Practices Testing

- Jalankan test sebelum commit
- Gunakan nama test yang jelas
- Pisahkan test backend dan frontend
- Hindari hardcode data sensitif
- Pastikan test independen
- Gunakan environment testing terpisah

<br>

# Testing & Security

Testing juga membantu memastikan:

- Authentication berjalan aman
- JWT token tervalidasi
- Password tidak terekspos
- Endpoint private terlindungi
- Role access berjalan sesuai hak akses

<br>

# Coverage Testing

Coverage menunjukkan seberapa banyak kode diuji.

Contoh:

```bash
pytest --cov=.
```

Target minimum coverage project:

- Backend ≥ 50%
- Frontend sesuai kebutuhan 

---

