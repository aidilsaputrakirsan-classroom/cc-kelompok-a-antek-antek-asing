# Release Notes — Milestone 2 (v2.0)

Pada dokumen ini menunjukkan  fase CI/CD & Production Deployment pada aplikasi Antick Async telah selesai yaitu: 
- berjalan sebagai aplikasi full-stack production,
- menggunakan Docker multi-container,
- memiliki CI pipeline otomatis,
- serta dapat diakses melalui internet menggunakan Cloudflare Tunnel.

<br> 

# Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://antick-async.online |
| Backend API | https://api.antick-async.online |
| API Docs (Swagger) | https://api.antick-async.online/docs |
| Health Check | https://api.antick-async.online/health |


<br>

## Fitur yang Sudah Tersedia
## Authentication & Authorization
- Register user
- Login menggunakan JWT
- Protected routes menggunakan token
- Approval system user
- Role-based access:
  - Employee
  - IT Support
  - Admin
  - Super Admin


##  Ticket Management
- Membuat tiket
- Mengedit tiket
- Menghapus tiket
- Monitoring status tiket
- Update progress ticket
- Ticket activity history


## Notification System
- Notifikasi approval user
- Notifikasi reject user
- Notifikasi perubahan status tiket
- Email notification



## Dashboard & Monitoring
- Dashboard monitoring tiket
- Statistik ticket
- Ringkasan aktivitas user
- Chart kategori ticket

<br>

## Docker & Containerization
- Frontend container
- Backend container
- PostgreSQL container
- Docker Compose orchestration
- Persistent PostgreSQL volume
- Healthcheck backend

<br>

## CI/CD & Production
- GitHub Actions CI Pipeline
- Automated backend testing (pytest)
- Automated frontend testing (Vitest)
- Docker image build validation
- Production smoke testing
- Deployment documentation
- Cloud deployment via Cloudflare Tunnel

<br>

## Tech Stack

| Layer | Technology |
|------|-------------|
| Frontend | React + Vite |
| Backend | FastAPI |
| Database | PostgreSQL |
| Containerization | Docker & Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | VPS + Cloudflare Tunnel |
| Authentication | JWT |
| Reverse Proxy | Nginx |

<br>

## Known Issues

| Issue | Status | Keterangan |
|------|--------|-------------|
| VPS lokal tidak selalu online | Known Issue | Deployment bergantung pada VPS lokal sehingga service dapat offline jika perangkat mati |
| Deployment masih semi-manual | Known Issue | Deploy production masih memerlukan `docker compose up --build -d` secara manual |
| Belum menggunakan auto rollback | Planned Improvement | Rollback masih dilakukan manual oleh DevOps |

<br> 

## Milestone Progress

| Milestone | Status |
|-----------|--------|
| Week 1–4: Full Stack Development | ✅ Completed |
| Week 5–7: Docker & Containerization | ✅ Completed |
| Week 8: UTS Demo | ✅ Completed |
| Week 9–11: CI/CD & Production Deployment | ✅ Completed |
| Week 12–14: Microservices | ⬜ Upcoming |

<br>

## Production Verification

Smoke test production berhasil dilakukan untuk:

- Frontend accessibility
- Backend health endpoint
- Swagger documentation
- Register & login
- CRUD ticket operations
- Authentication flow

Semua pengujian berhasil dijalankan pada environment production.

---


## Release Tag

```bash
git tag v2.0
git push origin v2.0