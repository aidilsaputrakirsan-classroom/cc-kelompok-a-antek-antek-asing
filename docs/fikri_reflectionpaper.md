# REFLECTION PAPER: DEVOPS ENGINEERING PADA PROJEK CLOUD COMPUTING "ANTICK ASYNC"

**Oleh:** Muhammad Fikri Haikal Ariadma
**NIM:** 10231063
**Peran:** Lead DevOps Engineer
**Mata Kuliah:** Cloud Computing (Kelompok A — Antek-Antek Asing)
**Institusi:** Institut Teknologi Kalimantan

---

## 1. Pendahuluan & Ringkasan Projek

**Antick Async** adalah sistem helpdesk dan ticketing internal berbasis cloud yang memungkinkan karyawan (*employee*) mengajukan tiket permasalahan teknis, ditangani oleh IT Support, dan dipantau admin melalui dashboard analitik. Secara arsitektur, sistem ini terdiri dari dua *microservice* utama (Auth Service dan Item Service), sebuah API Gateway berbasis Nginx, frontend React, dua database PostgreSQL terpisah, serta saluran publik melalui Cloudflare Tunnel — semuanya diorkestrasikan dalam tujuh container Docker.

Sebagai **Lead DevOps Engineer**, tanggung jawab utama saya meliputi: merancang dan memelihara seluruh infrastruktur kontainer (*containerization*), membangun dan menjaga pipeline CI/CD, mengonfigurasi API Gateway (routing, rate limiting, CORS), mengelola *deployment* ke server produksi, memastikan ketersediaan sistem melalui mekanisme *health check*, serta menerapkan praktik terbaik keamanan operasional seperti manajemen *secret*, *non-root container*, dan *log rotation*. Saya juga bertanggung jawab memastikan seluruh anggota tim dapat menjalankan sistem secara lokal dengan konfigurasi *development* yang konsisten.

---

## 2. Garis Besar Perkembangan DevOps (Modul 1–15)

Perjalanan DevOps dalam projek ini dibagi menjadi empat fase yang masing-masing membawa kompleksitas dan tantangan tersendiri:

### Fase 1: Fondasi Kontainerisasi (Modul 5–8)

Pada fase ini saya memulai penerapan Docker untuk membungkus aplikasi backend (FastAPI) dan frontend (React) yang sebelumnya dijalankan secara manual. Tantangan pertama yang muncul adalah menyesuaikan konfigurasi Dockerfile agar sesuai dengan kebutuhan masing-masing komponen: backend membutuhkan Python runtime dengan dependensi `psycopg`, sementara frontend membutuhkan proses build Node.js untuk menghasilkan aset statis sebelum disajikan oleh Nginx.

Saya juga mulai menyusun `docker-compose.yml` pertama yang menggabungkan backend, frontend, dan database PostgreSQL dalam satu jaringan internal. Pada fase ini, arsitektur masih berupa *monolith* — satu service backend, satu database, satu frontend.

### Fase 2: CI/CD Pipeline & Git Workflow (Modul 9–11)

Modul ini merupakan salah satu fase paling padat bagi saya. Saya merancang workflow GitHub Actions di `.github/workflows/ci.yml` untuk mengotomasi pengujian dan build setiap kali ada *push* atau *Pull Request* ke branch `main`. Pipeline dirancang terdiri dari tiga job awal: `test-backend` (pytest + coverage ≥ 50%), `test-frontend` (Vitest + vite build), dan `build-docker` yang hanya berjalan jika kedua test sebelumnya lulus.

Saya juga mengonfigurasi `CODEOWNERS` agar perubahan di area kode tertentu memerlukan review dari anggota yang bertanggung jawab — memastikan tidak ada perubahan krusial yang di-*merge* tanpa pengawasan. Selain itu, pada fase ini saya mempelajari pentingnya *concurrency cancel-in-progress* di GitHub Actions agar tidak ada pipeline tumpang tindih saat ada push beruntun ke branch yang sama.

### Fase 3: Microservices, Gateway, & Resilience (Modul 12–13)

Ketika tim memutuskan bermigrasi ke arsitektur *microservices*, `docker-compose.yml` berkembang dari 3 menjadi 7 service. Saya harus merancang ulang seluruh jaringan internal, *healthcheck chain* antar container (`auth-db → auth-service → item-service → gateway → cloudflared`), serta mengonfigurasi Nginx sebagai API Gateway tunggal yang menangani routing, CORS, dan rate limiting.

Pada Modul 13, saya menambahkan *resource limits* di seluruh service (`deploy.resources.limits`), membuat `docker-compose.dev.yml` sebagai override khusus pengembangan dengan hot-reload dan port debug terbuka, serta menulis `scripts/migrate_data.py` untuk migrasi data dari database monolith ke database per-service. Saya juga mulai menerapkan pola *dependency condition: service_healthy* agar container tidak naik sebelum dependensinya benar-benar siap.

### Fase 4: Observability, Security Hardening, & Final Production (Modul 14–15)

Fase terakhir berfokus pada kematangan operasional. Saya menambahkan *log rotation* (`json-file`, max 10MB × 3 file) ke seluruh 7 service, membuat `docker-compose.prod.yml` sebagai *production override* eksplisit, memperbaiki routing `/items/health` di Nginx yang sebelumnya menyebabkan StatusPage frontend selalu melaporkan Item Service sebagai *unreachable*, serta menyelesaikan *secret audit* menyeluruh: menghapus password superadmin produksi yang sempat bocor di `.env.example`, memparametrisasi `POSTGRES_PASSWORD` di `docker-compose.yml`, dan memperbarui format dokumentasi `.env.example`.

Puncak Modul 15 adalah verifikasi *end-to-end* deployment produksi menggunakan `scripts/verify-deployment.sh` yang saya buat — script ini memeriksa seluruh container, health endpoint, metrics endpoint, auth guard, dan frontend secara otomatis.

---

## 3. Struggle Terbesar & Perbaikan Terkritis

### A. Bug Silent: Healthcheck Gateway Gagal Karena Resolusi IPv6

**Masalah/Struggle:**
Ini adalah *struggle* paling kritis yang pernah saya hadapi dalam projek ini. Suatu ketika saat melakukan deploy ulang penuh di server produksi, seluruh domain `antick-async.online` dan `api.antick-async.online` tiba-tiba mengembalikan 503. Saya memeriksa status container dan menemukan bahwa `gateway` berstatus **unhealthy** terus-menerus, dan akibatnya `cloudflared` tidak pernah start karena menunggu gateway healthy.

Yang membuat ini sangat menyita waktu adalah tidak ada pesan error yang eksplisit. Healthcheck container terus gagal dengan exit code 1, padahal Nginx sudah berjalan normal dan bisa melayani request dari dalam container.

**Investigasi:**
Setelah menelusuri log secara mendalam, saya menemukan akar masalahnya: Nginx di dalam container hanya me-*listen* pada IPv4 karena file `nginx.conf` di-*mount* dengan mode *read-only* (`-v nginx.conf:/etc/nginx/conf.d/default.conf:ro`), yang mengakibatkan *entrypoint* Nginx gagal menambahkan listener IPv6 secara otomatis. Sementara itu, perintah `wget localhost/health` di dalam *healthcheck* menggunakan busybox yang me-*resolve* `localhost` ke `::1` (IPv6) tanpa *fallback* ke IPv4. Hasilnya: koneksi ditolak, healthcheck selalu gagal.

**Solusi (file `docker-compose.yml`):**
```yaml
healthcheck:
  # 127.0.0.1 (bukan localhost): nginx hanya listen IPv4 karena config
  # di-mount read-only, busybox wget me-resolve localhost ke ::1 tanpa fallback.
  test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1/health"]
```

Pelajaran terpenting: kegagalan infrastruktur tidak selalu bersuara keras. Kadang, sebuah perbedaan kecil antara `localhost` dan `127.0.0.1` cukup untuk menjatuhkan seluruh sistem produksi.

---

### B. Auth Service Crash-Loop Karena Format `.env` yang Salah

**Masalah/Struggle:**
Saat pertama kali mencoba menjalankan stack penuh di laptop yang berfungsi sebagai server akses produksi (terhubung ke Cloudflare Tunnel), `auth-service` terus-menerus *crash* dan di-*restart* dalam loop. Container `item-service`, `gateway`, dan `cloudflared` tidak pernah naik karena *healthcheck chain* menunggu `auth-service` healthy.

**Investigasi:**
Ada dua lapisan masalah yang ditemukan secara berurutan:

1. **Lapisan pertama:** `SECRET_KEY` tidak ada di file `.env` root. Config `pydantic-settings` menjalankan validator `validate_secret_key` saat startup dan langsung *raise* `ValidationError` jika kosong — *fail-fast* yang dirancang memang untuk mencegah JWT yang tidak aman, tapi efeknya mematikan container berulang kali.

2. **Lapisan kedua (setelah SECRET_KEY ditambahkan):** `CORS_ORIGINS` ditulis dalam format *comma-separated* seperti `https://antick-async.online,http://localhost` sesuai dokumentasi `.env.example` yang (ternyata) salah. Padahal `pydantic-settings` mencoba *JSON-decode* field bertipe `List[str]` sebelum validator kustom dijalankan — format *comma-separated* tidak valid sebagai JSON, sehingga `SettingsError` dilempar.

**Solusi:**
Format yang benar adalah JSON array: `CORS_ORIGINS=["https://antick-async.online","http://localhost"]`. Saya segera memperbarui `.env.example` agar anggota tim lain tidak mengalami masalah yang sama.

---

### C. Dockerfile Tidak Non-Root & Tidak Multi-Stage pada Kode Aktif

**Masalah/Struggle:**
Saat melakukan audit kesiapan UAS, saya menemukan ketidakkonsistenan yang cukup serius: `backend/Dockerfile` (monolith *legacy*, tidak aktif dipakai) sudah menerapkan pola *multi-stage build* dan *non-root user*, sementara kedua Dockerfile kode *microservices* aktif (`services/auth-service/Dockerfile` dan `services/item-service/Dockerfile`) masih menggunakan *single-stage* dan menjalankan container sebagai root. Ini berarti seluruh traffic produksi sebenarnya ditangani oleh container yang berjalan sebagai root — kerentanan keamanan nyata yang lolos dari perhatian sejak awal.

**Solusi:**
Saya merombak kedua Dockerfile mengikuti pola yang sudah terbukti benar di `backend/Dockerfile`:

```dockerfile
# Stage 1: Builder — install deps ke venv terisolasi
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final — hanya copy venv, tidak bawa build tools
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
RUN useradd -m appuser && chown -R appuser /app
USER appuser
```

Setelah rebuild dan deploy, verifikasi langsung di server: `docker exec antick-async-auth-service whoami` → `appuser`. Bukan `root`.

---

### D. CI Pipeline Tidak Mencakup Kode Microservices Aktif

**Masalah/Struggle:**
Selama berminggu-minggu, CI pipeline hanya menjalankan `pytest` terhadap folder `backend/` (monolith *legacy*) dan Vitest terhadap `frontend/`. Kode *microservices* aktif di `services/item-service/` — termasuk logika *retry* dan *circuit breaker* yang kritikal — sama sekali tidak punya test dan tidak di-*cover* oleh CI. Artinya, perubahan pada `auth_client.py` bisa masuk ke `main` tanpa ada validasi otomatis sama sekali.

**Solusi:**
Saya menambahkan job baru `test-item-service` di `.github/workflows/ci.yml` yang berjalan paralel dengan dua job test lainnya, dan memindahkan `build-docker` menjadi bergantung pada ketiga test sebelum berjalan:

```yaml
build-docker:
  needs: [test-backend, test-frontend, test-item-service]
```

Job ini menjalankan 6 *integration test* di `services/item-service/tests/integration/test_auth_client_reliability.py` yang memverifikasi perilaku *retry*, *circuit breaker*, dan penanganan error menggunakan `respx` sebagai HTTP mock — tanpa perlu auth-service benar-benar berjalan.

---

## 4. Keputusan Teknis yang Paling Saya Pertahankan

### Shared Module Diduplikasi, Bukan Di-Import Sebagai Package

Modul observabilitas (`logging_config.py`, `logging_middleware.py`, `metrics.py`) berada di `services/shared/` dan diduplikasi secara manual ke `services/auth-service/shared/` dan `services/item-service/shared/`. Ini terkesan tidak *DRY* (*Don't Repeat Yourself*), tapi ada alasan arsitekturalnya: setiap Docker image harus *self-contained*. Jika shared module diinstal sebagai Python package eksternal, setiap service akan bergantung pada registry atau path eksternal yang menambah kompleksitas build. Dengan duplikasi manual, setiap image dapat di-build secara independen tanpa dependensi eksternal selain `requirements.txt`.

Trade-off-nya nyata: sinkronisasi tiga salinan harus dilakukan manual setiap ada perubahan di `services/shared/`. Ini sudah pernah menyebabkan inkonsistensi metrik antar service di awal Modul 14 — bug yang cukup membingungkan sebelum ditemukan sumbernya.

### Frontend Tidak Di-Build di Dalam Docker

`frontend/Dockerfile` hanya melakukan `COPY dist ./` — tidak ada `npm run build` di dalam container. Keputusan ini diambil karena VPS tim memiliki RAM terbatas; build Node.js secara *in-container* pernah memicu OOM (*Out of Memory*) dan mematikan seluruh stack. Konsekuensinya: setiap perubahan frontend harus diikuti `npm run build` secara manual di mesin sebelum `docker compose build`. Ini adalah *operational overhead* yang disadari dan didokumentasikan di `README.md`.

---

## 5. Kesimpulan & Pembelajaran Terbesar

Menjalani peran DevOps dalam projek ini mengajarkan saya bahwa infrastruktur yang baik bukan yang paling canggih, melainkan yang paling dapat diandalkan dan dapat di-*debug* dengan cepat saat terjadi masalah.

Tiga pembelajaran utama yang saya bawa:

1. **Infrastruktur harus di-*version control* dan didokumentasikan dengan benar.** Setiap keputusan konfigurasi — dari alasan memilih `127.0.0.1` daripada `localhost` hingga mengapa CORS_ORIGINS harus JSON array — punya alasan teknis yang tidak selalu intuitif. Mencatatnya di `CHANGELOG.md` dan `docker-compose.yml` (sebagai komentar inline) terbukti menyelamatkan waktu saat debugging berulang.

2. **Healthcheck yang salah lebih berbahaya daripada tidak ada healthcheck.** Healthcheck yang selalu gagal bukan hanya membuat monitoring tidak akurat — ia juga memblokir seluruh *dependency chain* (*cloudflared* tidak naik sampai gateway *healthy*), yang berarti satu bug konfigurasi kecil bisa mengorbankan seluruh sistem. Validasi healthcheck harus dilakukan bukan hanya saat setup awal, tetapi juga setiap kali ada perubahan konfigurasi jaringan container.

3. **Security bukan fitur tambahan — ia adalah fondasi dari awal.** Menerapkan *non-root container* dan *multi-stage build* setelah beberapa modul berjalan jauh lebih sulit dan berisiko daripada menerapkannya dari awal. Audit keamanan di akhir projek idealnya hanya menjadi *konfirmasi*, bukan *temuan baru* — dan di projek ini, sayangnya, beberapa temuan baru tetap muncul.
