# CLAUDE.md — Master Context: Antick Async

> **WAJIB DIBACA PERTAMA KALI** oleh setiap AI agent / developer yang baru masuk ke project ini.
> File ini adalah *single source of truth* konteks project. Setelah membaca file ini, kamu seharusnya
> memahami seluruh project tanpa perlu membuka semua file satu per satu.

---

## ⚠️ INSTRUKSI WAJIB UNTUK SEMUA AI AGENT

Project ini dikerjakan oleh **tim 4 orang**, masing-masing dibantu AI agent. CLAUDE.md adalah
**jembatan penyelarasan konteks** antar semua agent. Aturan di bawah ini **TIDAK BOLEH dilanggar**:

1. **SETIAP perubahan WAJIB dicatat di `CHANGELOG.md`** — tanpa perlu diingatkan user.
   Berlaku untuk perubahan **sekecil apapun** (typo, rename, config) sampai perubahan besar
   (fitur baru, refactor, perubahan schema). Lakukan **otomatis** segera setelah melakukan perubahan.
   Format wajib (lihat detail di `CHANGELOG.md`):
   - **Apa yang dirubah** (file + deskripsi)
   - **Kenapa dirubah** (alasan/motivasi)
   - **Before → After** (kondisi sebelum dan sesudah)
   - **Timestamp** zona waktu **Balikpapan (WITA / UTC+8)**, format `YYYY-MM-DD HH:mm WITA`
2. **Update CLAUDE.md** jika perubahanmu mengubah hal yang didokumentasikan di sini
   (schema database, endpoint, kredensial, arsitektur, alur kerja, roadmap).
3. **Jangan hardcode secret** di kode. Semua secret lewat `.env` (sudah di-`.gitignore`).
   Jangan pernah menyalin isi `TUNNEL_TOKEN` atau secret produksi ke file yang di-commit.
4. **Ikuti konvensi commit** yang sudah berjalan: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
   (boleh dengan scope, contoh: `feat(gateway): ...`). Bahasa campuran ID/EN diperbolehkan.
5. **Alur kerja git**: buat feature branch (`feature/...`, `docs/...`, `fix/...`) → push → Pull Request
   ke `main`. **Jangan push langsung ke `main`** — CI berjalan pada push & PR ke `main`.
   Perhatikan `CODEOWNERS`: perubahan di area tertentu butuh review lead terkait.
6. **Jangan merusak backward compatibility gateway**: frontend memanggil API via gateway port 80
   dengan path `/auth/*`, `/items*`, dan path monolith lama (`/tickets`, `/users`, dst). Cek
   `services/gateway/nginx.conf` sebelum mengubah routing/prefix endpoint.
7. **Tes sebelum PR**: backend `pytest` (coverage min 50%, dijalankan CI dari folder `backend/`),
   frontend `npm test` (Vitest) + `npm run build` harus lolos.

---

## 1. Identitas Project

| Hal | Nilai |
|---|---|
| Nama aplikasi | **Antick Async** |
| Jenis | Sistem internal **helpdesk / ticketing** berbasis cloud |
| Konteks | Tugas mata kuliah Cloud Computing — Kelompok A "Antek Antek Asing" (ITK) |
| Repo GitHub | `aidilsaputrakirsan-classroom/cc-kelompok-a-antek-antek-asing` |
| Default branch | `main` |
| Live frontend | https://antick-async.online |
| Live API | https://api.antick-async.online (Swagger: `/docs`, health: `/health`) |
| Hosting | VPS lokal milik tim, diekspos ke internet via **Cloudflare Tunnel** (bisa offline) |

**Tujuan bisnis**: karyawan (employee) membuat tiket pekerjaan (maintenance, perbaikan perangkat,
isu teknis), IT Support menyelesaikannya, admin mengelola approval user & departemen, supervisor
memonitor produktivitas & KPI lewat dashboard. Semua aktivitas tercatat (audit trail).

## 2. Tim (Biodata Lengkap)

> Catatan: data di bawah adalah seluruh biodata yang terdokumentasi di repo
> (`docs/member-*.md`, `README.md`, `.github/CODEOWNERS`).

| Nama Lengkap | NIM | Peran | GitHub | Area Tanggung Jawab (CODEOWNERS) |
|---|---|---|---|---|
| Muhammad Athala Romero | 10231059 | **Lead Backend** | `@ItsHertz666` | `/backend/` |
| Muhammad Bagas Setiawan | 10231061 | **Lead Frontend** | `@bagsstywn` | `/frontend/` |
| Muhammad Fikri Haikal Ariadma | 10231063 | **Lead DevOps** | `@notyourkise` | `docker-compose.yml`, Dockerfile backend & frontend, `Makefile` |
| Nanda Aulia Putri | 10231067 | **Lead QA & Docs** | `@nanda-aulia` | `README.md`, `/docs/` |

Docker Hub yang dipakai untuk image: `notyourkisee/*` (mis. `notyourkisee/antick-async-frontend`).

## 3. Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | **FastAPI** (Python 3.12), SQLAlchemy ORM, Pydantic v2 + pydantic-settings, slowapi (rate limit), JWT (python-jose style, HS256) |
| Frontend | **React 19 + Vite 7**, react-router-dom 7, Tailwind CSS 3, axios/fetch, lucide-react, @splinetool/react-spline (3D scene), Vitest + Testing Library |
| Database | **PostgreSQL 16 (alpine)** — 2 database terpisah (database-per-service) |
| Gateway | **Nginx 1.25** (reverse proxy, rate limiting, CORS) |
| Container | **Docker + Docker Compose** (7 services) |
| CI/CD | **GitHub Actions** (`.github/workflows/ci.yml`, `health-check.yml`) |
| Deployment | VPS + **Cloudflare Tunnel** (`cloudflared` container) |

## 4. Arsitektur Microservices

```
[Browser] → HTTPS → [Cloudflare Tunnel (cloudflared)]
                          │
                          ▼
              [Nginx API Gateway :80]  ← satu-satunya port yang diekspos
       ┌──────────────┼──────────────────────┬───────────────┐
       ▼              ▼                      ▼               ▼
   /auth/*        /items*          /tickets,/users,/admin,   /
 (strip prefix)                    /categories,/notifications,
       │              │            /dashboard (tanpa strip)   │
       ▼              ▼                      ▼               ▼
 [auth-service]  [item-service]      [auth-service]    [frontend React+Nginx]
   FastAPI :8001   FastAPI :8002       (sama dgn /auth)
       │              │
       ▼              ▼
   [auth-db]      [item-db]
  PostgreSQL      PostgreSQL
   auth_db         item_db
```

Poin penting arsitektur:

- **auth-service** (`services/auth-service/`, port internal 8001) — bukan hanya auth:
  juga memegang **users, departments, categories, tickets, notifications, approval logs, dashboard**.
  Endpoint auth dipanggil via gateway dengan prefix `/auth/` (prefix di-strip),
  sedangkan endpoint domain (tickets dll.) dipanggil **tanpa** prefix.
- **item-service** (`services/item-service/`, port internal 8002) — CRUD items/inventory.
  Memvalidasi token dengan **memanggil auth-service** `GET /verify` via HTTP internal
  (`services/item-service/auth_client.py`, env `AUTH_SERVICE_URL=http://auth-service:8001`).
  `items.owner_id` menyimpan user id dari auth-service **tanpa foreign key** (DB terpisah).
- **gateway** (`services/gateway/nginx.conf`) — rate limit: `/auth/*` 5r/s (burst 10),
  `/items*` 20r/s (burst 50), umum 30r/s; respons 429 JSON. CORS whitelist:
  `antick-async.online`, `api.antick-async.online`, `localhost:*`. Network alias: `backend`.
- **frontend** — di-build dengan `VITE_API_URL=http://localhost` (semua call lewat gateway),
  disajikan oleh Nginx di dalam container.
- **`backend/` adalah monolith LAMA (legacy)** dari minggu 1–11. Masih dipertahankan karena
  **CI menjalankan pytest terhadap `backend/`**. Kode microservices aktif ada di `services/`.
  Jangan bingung antara keduanya; perubahan fitur baru masuk ke `services/`.
- **`services/shared/`** — modul logging JSON terstruktur, middleware request logging, dan
  in-memory metrics. Di-COPY (duplikat) ke `services/auth-service/shared/` dan
  `services/item-service/shared/` agar tiap image self-contained. **Jika mengubah shared,
  sinkronkan ketiga salinannya.**

## 5. Struktur Direktori Penting

```
├── services/                  ← KODE AKTIF (microservices)
│   ├── auth-service/          (main.py, models.py, schemas.py, crud.py, auth.py, config.py, database.py, shared/)
│   ├── item-service/          (main.py, models.py, schemas.py, auth_client.py, config.py, database.py, shared/)
│   ├── gateway/nginx.conf     (routing + rate limit + CORS)
│   └── shared/                (master copy logging/metrics)
├── backend/                   ← monolith legacy, target pytest CI (tests/ di sini)
├── frontend/                  ← React SPA (src/pages, src/components, src/context, src/services/api.js)
├── docs/                      ← dokumentasi tim (setup, docker, member, hasil test)
├── scripts/                   ← shell helper (docker, logs, wait-for-db)
├── .github/workflows/ci.yml   ← CI pipeline; health-check.yml ← cek produksi manual
├── docker-compose.yml         ← orkestrasi 7 service + healthcheck chain
├── Makefile                   ← shortcut: make up/build/down/clean/logs/ps/health/shell-*
└── .env                       ← secret lokal/produksi (TIDAK di-commit)
```

## 6. Schema Database

### auth_db (dimiliki auth-service)

| Tabel | Kolom utama |
|---|---|
| **users** | id PK, email (unique), name, hashed_password (bcrypt), role enum(`superadmin`,`admin`,`it_employee`,`employee`), department_id FK→departments, status enum(`PENDING`,`ACTIVE`,`REJECTED`), is_active bool (default false), must_change_password bool, approved_by FK→users, approved_at, avatar_index (0–9), created_at |
| **departments** | id PK, name (unique), description, created_at. Seed default: IT, Finance, HR, Operations, Sales |
| **categories** | id PK, name (unique), description, created_at, deleted_at (soft delete). Seed default: Hardware, Software, Network, Other |
| **tickets** | id PK, title, description, status enum(`open`,`in_progress`,`resolved`,`closed`), priority enum(`low`,`medium`,`high`,`urgent`), category_id FK, requester_id FK→users, assignee_id FK→users (nullable), created_at, updated_at |
| **approval_logs** | id PK, user_id FK, action (`APPROVED`/`REJECTED`), department_assigned FK, performed_by FK, performed_at, notes — audit trail approval |
| **otps** | id PK, email, otp_code, purpose enum(`REGISTER`,`RESET_PASSWORD`), created_at, expires_at |
| **notifications** | id PK, user_id FK, title, message, type enum(`user_pending`,`new_ticket`,`ticket_resolved`), reference_id, is_read, created_at |

Tabel dibuat otomatis via `Base.metadata.create_all()` + `run_startup_migrations()` saat startup
(lifespan). Superadmin, departemen default, dan kategori default di-seed otomatis saat startup.

### item_db (dimiliki item-service)

| Tabel | Kolom utama |
|---|---|
| **items** | id PK, name, description, price float, quantity int, owner_id int (user id dari auth-service, **bukan FK**), created_at, updated_at |

## 7. Kredensial & Environment Variables

> ⚠️ Nilai di bawah adalah kredensial **development/seed** yang memang sudah tercatat di repo
> (docker-compose.yml / .env.example). Secret produksi sesungguhnya hanya ada di file `.env`
> (di-gitignore) pada mesin masing-masing / VPS. **JANGAN menyalin nilai `.env` produksi
> (terutama `TUNNEL_TOKEN` dan `SMTP_PASSWORD`) ke file manapun yang di-commit.**

| Kredensial | Nilai (dev) | Lokasi |
|---|---|---|
| Superadmin seed | email `superadmin@admin.com` / password lihat `.env` (`SUPERADMIN_PASSWORD`) | di-seed otomatis saat startup auth-service; wajib ganti password saat login pertama (`must_change_password`) |
| PostgreSQL (kedua DB) | user `postgres` / password via `.env` `POSTGRES_PASSWORD` (default dev `postgres123`) | `docker-compose.yml` (`${POSTGRES_PASSWORD:-postgres123}`) |
| Database URL auth | `postgresql+psycopg://postgres:postgres123@auth-db:5432/auth_db` | env auth-service |
| Database URL item | `postgresql+psycopg://postgres:postgres123@item-db:5432/item_db` | env item-service |
| `SECRET_KEY` (JWT) | min 32 karakter, divalidasi saat startup (fail-fast) | `.env` root |
| `TUNNEL_TOKEN` | token Cloudflare Tunnel — **RAHASIA, hanya di `.env`** | `.env` root |
| SMTP (email notif) | host `smtp.hostinger.com:587`, from `no-reply@salut-utsamarinda.com` | `.env` (lihat `.env.example`) |
| Akses DB lokal | `make shell-auth-db` / `make shell-item-db` (psql di dalam container) | Makefile |

Env penting lain: `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=60`,
`CORS_ORIGINS` (comma-separated), `AUTH_SERVICE_URL`, `VITE_API_URL` (build-arg frontend),
`VITE_SPLINE_SCENE_URL` & `VITE_SPLINE_SCENE_URL_REGISTER` (3D scene halaman login/register).

## 8. Role & Aturan Akses (RBAC)

| Role | Hak |
|---|---|
| `employee` | Buat/edit tiket sendiri, lihat tiket sendiri, notifikasi, profil |
| `it_employee` | Semua tiket: ubah status/assignee/progress; lihat users (terbatas), departemen, dashboard |
| `admin` | + Approve/reject registrasi user, kelola departemen & kategori, hapus tiket, approval logs. Tidak bisa mengubah role admin/superadmin lain |
| `superadmin` | Semua akses admin + ubah role user (kecuali menaikkan ke superadmin), approval tingkat akhir |

Alur user baru: **register → status PENDING → admin approve (assign departemen) / reject → ACTIVE bisa login**.
Login menolak status `PENDING`/`REJECTED`/`is_active=false`. Logout & ganti password mem-blacklist JWT (jti).

## 9. Ringkasan API (via Gateway, port 80)

- **Auth** (`/auth/...` → di-strip): `POST /auth/register` (3/menit), `POST /auth/login` (5/menit, OAuth2 form),
  `POST /auth/logout`, `POST /auth/change-password`, `GET /auth/verify` (untuk service lain),
  `GET|PUT /auth/me`, `PUT /auth/users/me/avatar|department`, `GET /auth/health`, `GET /auth/metrics`
- **Users/Admin** (tanpa strip): `GET /users`, `PUT /users/{id}/role`, `GET /admin/pending-users`,
  `POST /admin/approve-user/{id}`, `POST /admin/reject-user/{id}`, `GET|POST|PUT|DELETE /admin/departments`,
  `GET /admin/approval-logs`
- **Tickets**: `POST|GET /tickets`, `GET /tickets/{id}`, `PUT /tickets/{id}/employee`,
  `PUT /tickets/{id}/admin`, `DELETE /tickets/{id}`
- **Categories**: `GET|POST /categories`, `PUT|DELETE /categories/{id}`
- **Notifications**: `GET /notifications`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all`
- **Dashboard**: `GET /dashboard`, `/dashboard/department-analytics`, `/dashboard/response-time-analytics`
- **Items** (item-service): `GET|POST /items`, `GET /items/stats`, `GET|PUT|DELETE /items/{id}` —
  semua butuh Bearer token, scoped per `owner_id`
- **Health/metrics**: `GET /health` (gateway inline), `/auth/health`, `/auth/metrics`,
  `/items/health`, `/items/metrics`

Frontend menyimpan token di localStorage dengan key `ticketflow_auth_token` (`frontend/src/services/api.js`).

## 10. Cara Menjalankan

```bash
# Prasyarat: Docker Desktop jalan, file .env ada di root (copy dari .env.example)
docker compose up --build -d     # atau: make build      (mode production)
make dev                         # mode DEVELOPMENT: hot-reload backend, tanpa cloudflared
make ps                          # status container
make health                      # cek gateway → {"status":"healthy"}
# Frontend: http://localhost  |  Auth docs: http://localhost/auth/docs
```

**Mode development** (`docker-compose.dev.yml`, via `make dev`): uvicorn `--reload` dengan
source di-mount, port debug terekspos (auth 8001, item 8002, auth-db 5433, item-db 5434),
`LOG_LEVEL=DEBUG`, cloudflared tidak dijalankan. Hot-reload frontend tetap via host:
`cd frontend && npm run dev` (port 5173).

**Mode production eksplisit** (`docker-compose.prod.yml`, via `make prod`): base compose +
penegasan `ENVIRONMENT=production` & `LOG_LEVEL=INFO`. Base compose sendiri sudah
production-safe, jadi deploy lama `docker compose up --build -d` tetap valid.
`make status` = ringkasan `ps` + health gateway/auth/item.

Dev tanpa Docker (legacy/parsial): backend `uvicorn main:app --reload` (port 8000).

Urutan healthcheck compose: `auth-db → auth-service → item-service`, `item-db → item-service`,
`gateway` start setelah semua healthy, lalu `cloudflared` start setelah gateway **healthy**.
Semua service punya `restart: unless-stopped` + `deploy.resources.limits`
(DB & FastAPI: 1 CPU/512M; frontend, gateway, cloudflared: 0.5 CPU/128M) + log rotation
`json-file` 10MB × 3 file.

**Migrasi data monolith → microservices**: `scripts/migrate_data.py` (idempotent,
jalankan saat mode dev karena butuh port DB terekspos; lihat docstring script).

## 11. CI/CD & Deployment

- **CI** (`ci.yml`, trigger push/PR ke `main`): ① pytest `backend/` dengan coverage ≥ 50% (SQLite),
  ② Vitest + `vite build` di `frontend/`, ③ `docker compose build` (hanya jika ①② lolos).
  Ada `concurrency` cancel-in-progress dan timeout 10 menit/job.
- **CD (semi-manual)**: setelah merge ke `main`, DevOps SSH ke VPS →
  `git pull origin main` → `docker compose up --build -d`. Verifikasi via workflow manual
  **Production Health Check** (`health-check.yml`).
- **Cloudflare Tunnel ingress**: `api.antick-async.online → http://gateway:80` dan
  `antick-async.online → http://gateway:80` (gateway punya alias network `backend`).

## 12. Roadmap & Status (per Juni 2026)

| Minggu | Target | Status |
|---|---|---|
| 1–4 | Setup, REST API + DB, React, integrasi full-stack + JWT | ✅ |
| 5–7 | Docker & Compose | ✅ |
| 8 | UTS Demo | ✅ |
| 9–11 | CI/CD Pipeline | ✅ |
| 12–14 | **Microservices** (auth/item split, gateway, observability, security hardening) | ✅ selesai di `main` |
| 15–16 | **Final & UAS** ← FOKUS SAAT INI | ⬜ |

Fitur yang sudah jalan: auth + approval workflow, ticket management, notifikasi, admin/superadmin
management, profil + avatar, dashboard & analytics, items CRUD + stats, structured logging,
metrics endpoint, health dashboard (StatusPage), rate limiting, error handling UI.

## 13. Isu yang Diketahui / Hal yang Perlu Diperhatikan

**Status Modul 13 per role** (audit 2026-06-12): porsi **DevOps selesai** (resource limits,
healthcheck gateway, `docker-compose.dev.yml`, `scripts/migrate_data.py`). Porsi
**Frontend** (error handling UI 503) dan **QA** (`docs/reliability-testing.md`) sudah merge.
**Belum dikerjakan**: porsi **Backend** — retry + exponential backoff & circuit breaker di
`services/item-service/auth_client.py` (saat ini baru timeout 5s + error handling),
graceful degradation (`/items/public`), dan `tests/integration/` (porsi QA workshop).

**Status Modul 14 per role** (audit 2026-06-12): porsi **Backend** (structured logging,
correlation ID, metrics + error alerting), **Frontend** (StatusPage + polish), dan
**DevOps** (log rotation semua service, `docker-compose.prod.yml`, Makefile
`dev`/`prod`/`logs`/`status`, fix route gateway `/items/health`, `scripts/logs.sh`) selesai.
**Belum dikerjakan**: porsi **QA** — `docs/operations-guide.md` (cara cek health, baca log,
trace correlation ID, troubleshooting).

**Status Modul 15 per role** (audit 2026-06-12): porsi **DevOps selesai** — secret audit
(parametrisasi `POSTGRES_PASSWORD`, `.env.example` diperbaiki), fix healthcheck gateway
(IPv6 `localhost` → `127.0.0.1`), production di-restore & diverifikasi
(`scripts/verify-deployment.sh` lolos 100% lokal + production). Rate limiting gateway
sudah ada sejak sebelumnya. **Porsi role lain**: Backend (jawaban viva), Frontend
(slide presentasi), QA (proofread docs, `docs/final-checklist.md`) — di luar repo/belum.
Tag `v3.0.0` dibuat setelah PR modul 15 merge.

⚠️ **Isu keamanan**: password superadmin asli sempat ter-commit di `.env.example`
(riwayat git repo classroom masih memuatnya). **Disarankan mengganti
`SUPERADMIN_PASSWORD` di `.env` production** karena nilai lama harus dianggap bocor.

- `docs/member-Nanda-Aulia-Putri.md` masih berisi **konflik merge yang belum diresolve**
  (marker `<<<<<<< HEAD`). Perlu dibersihkan.
- Duplikasi `shared/` di 3 lokasi (lihat §4) — wajib disinkronkan manual.
- `backend/` legacy masih jadi target test CI; jika suatu saat dihapus, **CI harus diubah dulu**.
- Tabel `otps` dan konfigurasi SMTP sudah ada, tetapi alur OTP/email belum sepenuhnya terpasang
  di endpoint — cek sebelum mengandalkan fitur email.
- README masih menyebut beberapa info lama (port 8000 monolith) — bagian atas README yang akurat.

---

*Terakhir diperbarui: 2026-06-12 02:15 WITA — pembuatan awal oleh AI agent (Claude).*
*Jika kamu mengubah sesuatu yang membuat file ini tidak akurat, perbaiki file ini juga dan catat di CHANGELOG.md.*
