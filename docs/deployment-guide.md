# Deployment Guide — Antick Async

Panduan ini menjelaskan cara deploy dan mengelola aplikasi **Antick Async** di infrastruktur VPS dengan Cloudflare Tunnel.

---

## Arsitektur Production

```
Internet
   │
   ▼
Cloudflare Tunnel (cloudflared)
   ├── antick-async.online      → Frontend (Nginx, port 3000)
   └── api.antick-async.online  → Backend (FastAPI, port 8000)
           │
           ▼
   PostgreSQL (port 5432, internal only)
```

Semua services berjalan di dalam **Docker Compose** di VPS lokal (Windows ARM64 PC). Cloudflare Tunnel mengekspos layanan ke internet tanpa membuka port di router.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `postgresql://postgres:xxx@db:5432/cloudapp` | Koneksi PostgreSQL (internal Docker network) |
| `SECRET_KEY` | `(hex 64 chars)` | JWT signing key — **jangan pakai default!** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Durasi token |
| `ALLOWED_ORIGINS` | `https://antick-async.online` | CORS whitelist (domain frontend) |
| `SUPERADMIN_EMAIL` | `superadmin@admin.com` | Email superadmin pertama |
| `SUPERADMIN_PASSWORD` | `(password kuat)` | Password superadmin |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP untuk notifikasi email |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `email@gmail.com` | SMTP username |
| `SMTP_PASSWORD` | `(app password)` | SMTP password |
| `MAIL_FROM` | `email@gmail.com` | Sender address |
| `MAIL_FROM_NAME` | `Antick Async` | Sender display name |

### Frontend (`.env.production`)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.antick-async.online` |

> File `.env.production` di-commit ke repository karena hanya berisi URL publik.
> File `backend/.env` **TIDAK** di-commit (ada di `.gitignore`) — berisi secrets.

### GitHub Secrets (untuk CI pipeline)

| Secret | Keterangan |
|--------|------------|
| *(tidak diperlukan)* | CD dilakukan secara manual — tidak ada GitHub Secret untuk deploy |

---

## Proses Deployment Manual (Continuous Delivery)

Setelah PR di-merge ke `main`, ikuti langkah berikut di VPS:

### 1. Akses VPS

```bash
# SSH ke VPS atau buka terminal langsung di PC VPS
```

### 2. Masuk ke direktori project

```bash
cd /path/to/cc-kelompok-a-antek-antek-asing
```

### 3. Pull perubahan terbaru dari main

```bash
git pull origin main
```

### 4. Build ulang dan jalankan semua services

```bash
docker compose up --build -d
```

Flag `--build` memastikan image di-rebuild dari kode terbaru. Flag `-d` menjalankan di background.

### 5. Verifikasi semua container berjalan

```bash
docker compose ps
```

Output yang diharapkan:

```
NAME         STATUS          PORTS
db           Up (healthy)    0.0.0.0:5433->5432/tcp
backend      Up (healthy)    0.0.0.0:8000->8000/tcp
frontend     Up              0.0.0.0:3000->80/tcp
cloudflared  Up
```

### 6. Lakukan health check

```bash
curl https://api.antick-async.online/health
```

Response yang diharapkan:

```json
{"status": "healthy"}
```

### 7. Trigger GitHub Actions Health Check (opsional)

Buka GitHub → **Actions** → **🏥 Production Health Check** → **Run workflow** → klik **Run workflow**.

Ini menjalankan verifikasi otomatis dari GitHub's runner dan menyimpan hasilnya sebagai job summary.

---

## Rollback Instructions

### Rollback ke commit sebelumnya

Jika deployment terbaru menyebabkan error:

#### Opsi A: Revert dengan git (Recommended)

```bash
# Di VPS, lihat log commit
git log --oneline -10

# Buat revert commit (tidak menghapus history)
git revert HEAD --no-edit

# Push revert ke main
git push origin main

# Deploy ulang dengan kode yang sudah di-revert
docker compose up --build -d
```

#### Opsi B: Checkout ke commit tertentu (cepat, tapi detached HEAD)

```bash
# Di VPS, lihat log dan catat SHA commit yang stabil
git log --oneline -10

# Checkout ke commit terakhir yang stabil
git checkout <commit-sha>

# Deploy ulang
docker compose up --build -d
```

> ⚠️ Setelah rollback via Opsi B, buat PR di GitHub untuk me-revert perubahan bermasalah secara resmi agar `main` branch kembali ke kondisi stabil.

### Rollback database (jika ada migrasi)

Karena aplikasi ini menggunakan SQLAlchemy dengan `create_all()` (bukan Alembic migration), rollback database dilakukan dengan:

1. Stop backend: `docker compose stop backend`
2. Akses PostgreSQL: `docker compose exec db psql -U postgres -d cloudapp`
3. Hapus tabel yang ditambahkan secara manual jika perlu
4. Restart backend: `docker compose start backend`

---

## Troubleshooting

| Gejala | Kemungkinan Penyebab | Solusi |
|--------|---------------------|--------|
| Frontend blank page | `VITE_API_URL` salah saat build | Verifikasi `.env.production`, build ulang image |
| CORS error di browser | `ALLOWED_ORIGINS` tidak include domain frontend | Update env var di `backend/.env`, restart backend |
| `502 Bad Gateway` dari Cloudflare | Container backend mati | `docker compose restart backend`, cek logs |
| Login gagal (token error) | `SECRET_KEY` berubah antar deploy | Pastikan `SECRET_KEY` sama — jangan generate ulang jika ada user aktif |
| Database koneksi error | Container `db` belum ready saat backend start | `docker compose restart backend` (tunggu db healthy dulu) |
| Tunnel tidak connect | `cloudflared` container mati atau token expired | `docker compose restart cloudflared`, cek Cloudflare dashboard |

### Cek logs per service

```bash
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs db --tail=50
docker compose logs cloudflared --tail=50
```

---

## Referensi

- Cloudflare Tunnel docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Docker Compose reference: https://docs.docker.com/compose/
- FastAPI deployment: https://fastapi.tiangolo.com/deployment/
