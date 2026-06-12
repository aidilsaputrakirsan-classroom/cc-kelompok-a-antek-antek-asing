# ☁️  Cloud App - Antick Async

![CI Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-antek-antek-asing/actions/workflows/ci.yml/badge.svg)


## 📑 Table of Contents

- [🌐 Live Demo](#-live-demo)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [👥 Role Sistem](#-role-sistem)
- [🚀 Fitur Utama Sistem](#-fitur-utama-sistem)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Microservices Architecture Overview](#️-microservices-architecture-overview)
- [🧩 Backend Services](#-backend-services)
- [🔐 Security Features](#-security-features)
- [📈 Monitoring Features](#-monitoring-features)
- [⚙️ Environment Variables (.env)](#️-environment-variables-env)
- [⚡ Quick Start (Local Development)](#-quick-start-local-development)
- [🚀 Running with Docker Compose](#-running-with-docker-compose)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [📄 Detail Testing Documentation](#-detail-testing-documentation)
- [📅 Roadmap](#-roadmap)
- [📅 Architecture Evolution](#-architecture-evolution)
- [📁 Project Structure](#-project-structure)

<br> 

# Deskripsi Proyek
Antick Async merupakan sistem internal helpdesk berbasis cloud yang dirancang untuk membantu perusahaan dalam mengelola alur pekerjaan internal secara tersturktur dan terdokumentasi. Karyawan dapat membuat serta menyelesaikan tiket pekerjaan seperti maintance, perbaikan perangkat hingga teknis lainnya, serta dapat mempermudah dalam pencatatan dan evaluasi performa karyawan dengan melalui Antick Async. 

Setiap tiket terdapat waktu pembuatan hingga penyelesaian serta seluruh aktivitas kerja yang akan dicatat dan dimonitoring secara sistematis. Dengan adanya sistem Antick Async, perusahaan dapat meningkatkan transparansi operasional, serta memastikan setiap tugas akan terdokumentasi secara terpusat sehingga supervisor dapat memonitor produktivitas harian serta mengevaluasi pencapain KPI secara lebih objektif dan berbasis data. 



## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | [https://antick-async.online](https://antick-async.online) |
| Backend API | [https://api.antick-async.online](https://api.antick-async.online) |
| API Docs (Swagger) | [https://api.antick-async.online/docs](https://api.antick-async.online/docs) |
| Health Check | [https://api.antick-async.online/health](https://api.antick-async.online/health) |

> Deployed di VPS lokal yang terekspos ke internet via **Cloudflare Tunnel**.  
> VPS mungkin tidak selalu online — jika tidak dapat diakses, deployment sedang tidak aktif.

## 🔄 CI/CD Pipeline

**Continuous Integration** berjalan otomatis saat push ke `main`:

1. ✅ Test backend (pytest, min 50% coverage)
2. ✅ Test frontend (Vitest + Vite build)
3. ✅ Build Docker images

**Continuous Delivery** (semi-manual):

- Setelah merge ke `main`: DevOps akses VPS → `git pull origin main` → `docker compose up --build -d`
- Health check tersedia via GitHub Actions: [🏥 Production Health Check](.github/workflows/health-check.yml) (jalankan manual setelah deploy)


## 👥 Role Sistem

Sistem memiliki 4 role utama:

1. Employee (Requester / User)
 
- Membuat tiket permintaan
- Mengedit tiket sendiri
- Melihat detail & history tiket
Menerima notifikasi status tiket
2. IT Support Employee (Resolver)
- Menyelesaikan tiket
- Mengubah status pengerjaan tiket
- Menentukan siapa yang menyelesaikan tiket
- Update progress ticket
3. Admin
- Approval user
- Mengelola departemen user
- Menolak / menerima registrasi user
- Monitoring dashboard approval
4. Super Admin
- Semua akses Admin
-Mengubah role user
- Mengatur departemen user serta Approval tingkat akhir

---
## 🚀 Fitur Utama Sistem
1. Authentication & Approval System
- Login user hanya bisa setelah approval admin/superadmin
- Validasi email saat register
- Validasi password saat register
- Notifikasi status approval (accept/reject)
- Email rejection notification

2. Ticket Management
- Employee membuat tiket
- Employee dapat edit tiket
- Detail tiket lengkap
- History status pengerjaan tiket
- Status pengerjaan dapat diubah IT Support
3. Notification System
- Notifikasi permintaan user baru
- Notifikasi approval/reject user
- Notifikasi update status tiket
- Notifikasi user kembali aktif
4. Admin Management
- Approval dashboard user (accept/reject)
- Manajemen departemen user
- Role management (superadmin)
- penanda status approval user
5. User Profile
- User dapat ubah avatar
- User profile management
- User dapat mengubah kata sandi
5. Dashboard & Monitoring
- Dashboard waiting approval
- Monitoring tiket
- Filter status pengerjaan tiket


## Tim

| Nama | NIM | Peran |
|------|-----|--------|
| Muhammad Athala Romero | 10231059| Lead Backend |
| Muhammad Bagas Setiawan  | 10231061 | Lead Frontend |
|Muhammad Fikri Haikal Ariadma   | 10231063 | Lead DevOps |
| Nanda Aulia Putri | 10231067 | Lead QA & Docs |

## 🛠️ Tech Stack

| Layer | Teknologi |
|------------|---------|
| Backend | **FastAPI** (Python 3.12), SQLAlchemy ORM, Pydantic v2 + pydantic-settings, slowapi (rate limit), JWT (python-jose style, HS256) |
| Frontend | **React 19 + Vite 7**, react-router-dom 7, Tailwind CSS 3, axios/fetch, lucide-react, @splinetool/react-spline (3D scene), Vitest + Testing Library |
| Database | **PostgreSQL 16 (alpine)** — 2 database terpisah (database-per-service) |
| Gateway | **Nginx 1.25** (reverse proxy, rate limiting, CORS) |
| Container | **Docker + Docker Compose** (7 services) |
| CI/CD | **GitHub Actions** (`.github/workflows/ci.yml`, `health-check.yml`) |
| Deployment | VPS + **Cloudflare Tunnel** (`cloudflared` container) |


## 🏗️ Microservices Architecture Overview

```mermaid
flowchart TD
    A[Client / Browser]
    B[Cloudflare Tunnel]
    C["Nginx API Gateway (Port 80)"]

    D["/auth/*"]
    E["/items/*"]
    F["/"]

    G["Auth Service<br/>(FastAPI)"]
    H["Item Service<br/>(FastAPI)"]
    I["React SPA"]

    J["auth_db<br/>(PostgreSQL)"]
    K["item_db<br/>(PostgreSQL)"]

    A -->|HTTPS| B
    B --> C

    C --> D
    C --> E
    C --> F

    D --> G
    E --> H
    F --> I

    G --> J
    H --> K
```

## 🧩 Backend Services

1. **Auth Service (Port 8001)**: Menangani registrasi, login JWT, manajemen role, departemen, dan profil user. Mendelegasikan verifikasi token untuk service lain.
2. **Item Service (Port 8002)**: Menangani CRUD resource (Items) dengan berinteraksi ke Auth Service secara internal untuk memvalidasi token JWT.
3. **Gateway (Nginx)**: *Reverse Proxy* dan *Rate Limiter* yang meneruskan *request* dari *client* ke service yang tepat.

## 🔐 Security Features
- **JWT Authentication**: Akses resource dilindungi dengan token.
- **Role-based Access Control (RBAC)**: Pembatasan rute berdasarkan role (Employee, Admin, Superadmin).
- **Rate Limiting**: Nginx Gateway membatasi request per detik (`5r/s` untuk auth, `20r/s` untuk API umum) guna mencegah serangan *Brute Force* dan *DoS*.
- **Input Validation**: Pydantic schema enforcing batas panjang string, regex password (huruf besar, angka, batas 128 karakter), dan *integer constraints*.
- **Secret Management**: *Environment variables* digunakan secara ketat tanpa ada *hardcoded credentials* di repositori.

## 📈 Monitoring Features
- **Structured Logging**: Log diformat seragam dengan JSON-compatible format di semua service.
- **Metrics Endpoint**: Tersedia endpoint `/metrics` di setiap *service* untuk di-*scrape* oleh Prometheus.
- **Health Checks**: Endpoint `/health` dan integrasi *Docker Compose healthchecks*.
- **Status Dashboard**: Endpoint internal untuk memantau performa dan respons waktu sistem.

## ⚙️ Environment Variables (.env)
Gunakan file template `.env.example` yang tersedia di masing-masing service (`services/auth-service/` dan `services/item-service/`) lalu ubah menjadi `.env`.

**Contoh Auth Service `.env`:**
```ini
DATABASE_URL=postgresql://postgres:password@auth-db:5432/auth_db
SECRET_KEY=YOUR_SECURE_SECRET_KEY_MIN_32_CHARS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SUPERADMIN_PASSWORD=YOUR_STRONG_PASSWORD
```

## ⚡ Quick Start (Local Development)

### Clone Repository
```bash
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-antek-antek-asing.git
```

### Backend
```bash

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

Backend berjalan pada:

http://localhost:8000
```

--- 
### Frontend
```bash

cd frontend

npm install

npm run dev

Frontend berjalan pada:

http://localhost:5173
Docker Compose

Menjalankan seluruh sistem menggunakan Docker:

docker compose up --build -d

Melihat logs seluruh container:

docker compose logs -f
```


## 🚀 Running with Docker Compose
```bash
Aplikasi dideploy menggunakan Docker Compose untuk orkestrasi seluruh arsitektur *microservices*.

```bash
# Build dan jalankan seluruh container
docker compose up --build -d

# Pantau logs dari backend
docker compose logs -f auth-service item-service gateway
```

## 📚 API Documentation
Dokumentasi interaktif OpenAPI (Swagger) dapat diakses di:
- **Auth Service**: `http://localhost/auth/docs` (Via Gateway)
- **Item Service**: `http://localhost/items/docs` (Via Gateway)

Kontrak API lengkap juga tersedia di `docs/api-contract.md`.



## 🧪 Testing

#### 🔐 Authentication

| Test Case | Deskripsi | Hasil |
|----------|----------|------|
| Register User | Input email & password valid | ✅ Berhasil |
| Login User | Login dengan data benar | ✅ Berhasil mendapatkan token autentifikasi |
| Login Invalid | Data salah |✅ sistem menolak dan menampilkan pesan error|

#### 📦 CRUD Items

| Test Case | Deskripsi | Hasil |
|----------|----------|------|
| Add Item | Tambah item baru | ✅ Item berhasil ditambahkan |
| Get Items | Ambil semua item | ✅ item berhasil menampilkan seluruh item yang tersedia|
| Update Item | Edit data item | ✅ Perubahan berhasil tersimpan |
| Delete Item | Hapus item | ✅ Item berhasil terhapus |
| Empty Input | Input kosong | ✅ Sistem menolak dan menampilkan pesan error |
| Invalid Email | Format email salah | ✅ Sistem menolak email dengan format yang tidak valid|
|Strength Password | Password tidak sesuai kriteria | ✅ Sistem menolak password yang tidak memenuhi kriteria keamanan |


## 📄 Detail Testing Documentation

Dokumentasi pengujian lengkap tersedia pada:

- [Testing Guide](docs/testing-guide.md)
- [Reliability Testing Report](docs/reliability-testing.md)
- [UI Testing Documentation](docs/ui-testing.md)
- [UI Test Results](docs/ui-test-results.md)
- [API Contract Documentation](docs/api-contract.md)

---
## 📅 Roadmap

| Minggu | Target                    | Status |
|--------|---------------------------|--------|
| 1      | Setup & Hello World       | ✅ |
| 2      | REST API + Database       | ✅ |
| 3      | React Frontend            | ✅ |
| 4      | Full-Stack Integration    | ✅ |
| 5–7    | Docker & Compose          | ✅ |
| 8      | UTS Demo                  | ✅ |
| 9–11   | CI/CD Pipeline            | ✅ |
| 12–14  | Microservices             | ✅|
| 15–16  | Final & UAS               | ✅ |

## 📅 Architecture Evolution

| Phase              | Weeks | Architecture                               | Status |
|-------------------|-------|--------------------------------------------|--------|
| Foundation        | 1–4   | Monolith (FastAPI + React + PostgreSQL)    | ✅ |
| Containerization  | 5–7   | Docker Compose (3 containers)              | ✅ |
| CI/CD             | 9–11  | GitHub Actions + Railway Deployment        | ✅ |
| Microservices     | 12–14 | 2 Services + Gateway + Monitoring          | ✅ |
| Final             | 15–16 | Security Hardened + Production Ready       | ✅ |


## 📁 Project Structure
```
CC-KELOMPOK-A-ANTEK-ANTEK-ASING
│
├── .github/
│   ├── workflows/                  # CI/CD workflow
│   └── CODEOWNERS                  # Reviewer assignment
│
├── backend/                     # Monolithic backend (legacy/reference)
│   ├── __pycache__/
│   ├── tests/
│   ├── .coverage
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── auth.py                     # Authentication & JWT
│   ├── config.py                   # Environment configuration
│   ├── crud.py                     # CRUD logic
│   ├── database.py                 # Database connection
│   ├── Dockerfile                  # Backend container
│   ├── main.py                     # Main FastAPI application
│   ├── models.py                   # Database models
│   ├── schemas.py                  # Request/response schemas
│   ├── pytest.ini                  # Pytest configuration
│   ├── requirements.txt            # Dependencies
│   └── test.db                     # Testing database
│
├── docs/                        # Project documentation
│   ├── architecture.md             # System architecture
│   ├── deployment-guide.md         # Deployment guide
│   ├── docker-architecture.md      # Docker & container flow
│   ├── reliability-testing.md      # Reliability testing
│   ├── testing-guide.md            # General testing guide
│   ├── testing-ui-project.md       # UI testing scenario
│   ├── ui-test-result.md           # UI testing result
│   ├── production-test.md          # Production readiness test
│   ├── api-contract.md             # API contract documentation
│   ├── operations-guide.md         # Operations documentation
│   └── img/                        # Screenshots & assets
│
├── frontend/                    # Frontend (React + Vite)
│   ├── vite/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── scripts/
│   ├── docker-run.sh
│   ├── docker-logs.sh
│   ├── migrate-data.sh
│   ├── verify-deployment.sh
│   └── wait-for-db.sh
│
├── services/                    # Microservices architecture
│   │
│   ├── auth-service/
│   │   ├── main.py                 # Authentication endpoints
│   │   ├── models.py              # User model
│   │   ├── schemas.py             # Validation schema
│   │   ├── database.py            # DB connection
│   │   ├── Dockerfile
│   │   └── shared/
│   │       ├── __init__.py
│   │       ├── logging_config.py
│   │       ├── logging_middleware.py
│   │       └── metrics.py
│   │
│   ├── gateway/
│   │   └── nginx.conf             # API Gateway routing
│   │
│   ├── item-service/
│   │   ├── main.py                # CRUD item & statistics
│   │   ├── auth_client.py         # Inter-service auth verification
│   │   ├── models.py              # Item model
│   │   ├── Dockerfile
│   │   └── shared/
│   │       ├── __init__.py
│   │       ├── logging_config.py
│   │       ├── logging_middleware.py
│   │       └── metrics.py
│   │
│   └── shared/
│       ├── __init__.py
│       ├── logging_config.py
│       ├── logging_middleware.py
│       └── metrics.py
│
├── .env
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── CLAUDE.md
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.yml
├── Makefile
├── pyproject.toml
└── README.md
```