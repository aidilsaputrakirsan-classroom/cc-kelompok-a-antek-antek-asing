# CHANGELOG — Antick Async

> Semua perubahan pada sistem ini **WAJIB** dicatat di file ini — sekecil apapun perubahannya.
> Aturan lengkap ada di [CLAUDE.md](CLAUDE.md) §"Instruksi Wajib untuk Semua AI Agent".
> Entri terbaru ditulis **paling atas**.

## Format Entri (WAJIB diikuti)

```markdown
## [YYYY-MM-DD HH:mm WITA] — <judul singkat perubahan>

**Author**: <nama anggota / AI agent yang mengerjakan>
**Apa yang dirubah**:
- <daftar file + deskripsi perubahan>

**Kenapa dirubah**:
<motivasi / kebutuhan yang memicu perubahan>

**Before**:
<kondisi/perilaku/kode sebelum perubahan — boleh cuplikan kode>

**After**:
<kondisi/perilaku/kode sesudah perubahan — boleh cuplikan kode>

**Alasan melakukan perubahan**:
<justifikasi teknis kenapa solusi ini yang dipilih>
```

> Timestamp menggunakan zona waktu **Balikpapan (WITA / UTC+8)**.

---

## [2026-06-12 10:10 WITA] — Modul 14 (porsi DevOps): prod override, log rotation menyeluruh, fix route /items/health

**Author**: Muhammad Fikri Haikal Ariadma (Lead DevOps) — dikerjakan via AI Agent (Claude)
**Apa yang dirubah**:
- `services/gateway/nginx.conf` — tambah `location /items/health` yang mem-proxy ke
  `item-service:/health` (dengan rate limit general).
- `docker-compose.yml` — tambah log rotation `json-file` (max 10MB × 3 file) pada 5 service
  yang belum punya: auth-db, item-db, frontend, gateway, cloudflared.
- `docker-compose.prod.yml` — **file baru**: override production tipis yang menegaskan
  `ENVIRONMENT=production` + `LOG_LEVEL=INFO` (Tugas Terstruktur Modul 14 DevOps).
- `Makefile` — tambah target `prod` (compose base + prod override) dan `status`
  (ringkasan `ps` + health gateway/auth/item). Melengkapi set `dev`/`prod`/`logs`/`status`
  yang diminta modul.

**Kenapa dirubah**:
Mengerjakan Tugas Terstruktur Modul 14 role Lead DevOps (branch `feature/docker-production`)
plus sisa Workshop 14.5 (Docker centralized logging). Route `/items/health` adalah langkah
Workshop 14.4 yang terlewat di gateway dan menyebabkan bug nyata di StatusPage.

**Before**:
- StatusPage frontend memanggil `GET /items/health`, tetapi gateway tidak punya route itu —
  request jatuh ke `location /items` → diteruskan sebagai `/items/health` → cocok dengan
  route FastAPI `GET /items/{item_id}` yang butuh auth → respons 401/422, kartu
  "Item Service" di StatusPage **selalu tampil "unreachable"** meski service sehat.
- Hanya auth-service & item-service yang punya log rotation; log container lain
  (terutama cloudflared yang verbose) tumbuh tanpa batas → risiko disk VPS penuh.
- Tidak ada `docker-compose.prod.yml`; mode production hanya implisit dari base compose.
- Makefile belum punya target `prod` dan `status`.

**After**:
- `GET /items/health` via gateway mengembalikan health JSON item-service; StatusPage bisa
  menampilkan status Item Service dengan benar.
- Semua 7 service punya log rotation 10MB × 3.
- `make prod` menjalankan stack dengan env production eksplisit; `make status` menampilkan
  status container + health 3 service sekaligus.
- Verifikasi: `docker compose config` valid untuk base/dev/prod; sintaks nginx lolos
  `nginx -t` (diuji di container nginx:1.25-alpine).

**Alasan melakukan perubahan**:
Base compose sudah production-safe sejak Modul 13 (hanya gateway terekspos, limits, restart
policy) sehingga `docker-compose.prod.yml` dibuat tipis dan **deploy lama di VPS
(`docker compose up --build -d`) tetap berfungsi identik** — tidak ada risiko terhadap web
production yang sedang online. Workshop 14.1–14.4 (structured logging, correlation ID,
metrics, StatusPage) tidak disentuh karena sudah dikerjakan dan merge oleh role lain;
hanya gap di sisi infra yang ditutup, sesuai prinsip "jangan ada perubahan jika tidak perlu".

---

## [2026-06-12 02:45 WITA] — Modul 13 (porsi DevOps): compose resilience, dev override, data migration script

**Author**: Muhammad Fikri Haikal Ariadma (Lead DevOps) — dikerjakan via AI Agent (Claude)
**Apa yang dirubah**:
- `docker-compose.yml` — tambah `deploy.resources.limits` (CPU & memory) di seluruh 7 service;
  tambah `healthcheck` pada `gateway` (wget ke `/health`); `cloudflared` kini `depends_on`
  gateway dengan `condition: service_healthy` (sebelumnya hanya menunggu start).
- `docker-compose.dev.yml` — **file baru**: override development dengan hot-reload uvicorn
  untuk auth-service & item-service (source di-mount), port debug terekspos
  (8001/8002, DB 5433/5434), `LOG_LEVEL=DEBUG`, dan cloudflared dinonaktifkan via profile.
- `scripts/migrate_data.py` — **file baru**: script migrasi data monolith (`cloudapp`) →
  microservices (`auth_db` + `item_db`), diadaptasi ke schema asli project.
- `Makefile` — tambah target `dev` dan `dev-down`.

**Kenapa dirubah**:
Mengerjakan Tugas Terstruktur Modul 13 untuk role Lead DevOps (branch
`feature/compose-resilience`): restart policy, resource limits, dev override, plus fokus
workshop DevOps (data migration script & healthcheck improvement). `restart: unless-stopped`
sudah terpasang sebelumnya di semua service sehingga tidak ada perubahan untuk poin itu.

**Before**:
- Tidak ada batasan resource — satu container bocor memori bisa membunuh seluruh VPS
  (VPS tim memorinya kecil; build frontend saja harus dilakukan di luar Docker karena OOM).
- Gateway tidak punya healthcheck; cloudflared start begitu gateway start (belum tentu siap)
  sehingga tunnel bisa meneruskan traffic ke gateway yang belum sehat.
- Tidak ada mode development — setiap perubahan kode backend butuh rebuild image penuh.
- Tidak ada script migrasi data monolith → microservices (Workshop 13.3 belum dikerjakan).

**After**:
- Limits: auth-db/item-db/auth-service/item-service `1.0 CPU / 512M`; frontend/gateway/
  cloudflared `0.5 CPU / 128M` (limit = plafon, bukan reservasi — tidak mengubah perilaku normal).
- Healthcheck chain penuh: `auth-db → auth-service → item-service → gateway (healthy) → cloudflared`.
- `make dev` menjalankan stack development hot-reload tanpa cloudflared; `make dev-down` menghentikannya.
- `scripts/migrate_data.py` idempotent (ON CONFLICT DO NOTHING), menyalin kolom beririsan,
  menangani self-FK `users.approved_by` (2-pass), dan me-reset sequence PostgreSQL.
- Verifikasi: `docker compose config` valid untuk kedua mode; dev mode terbukti
  meng-exclude cloudflared; `py_compile` script migrasi lolos.

**Alasan melakukan perubahan**:
Mengikuti instruksi Modul 13 tanpa menjiplak mentah: script migrasi modul hanya menyalin
4 kolom users — tidak cocok dengan schema project (role/status/approval/self-FK) dan tidak
me-reset sequence (akan menyebabkan duplicate key setelah migrasi), sehingga diadaptasi.
Resource limits dipilih konservatif agar aman di VPS kecil. Healthcheck gateway memakai
endpoint `/health` inline nginx (tanpa dependensi upstream) sehingga tidak menimbulkan
false-negative. Semua perubahan bersifat aditif dan tidak mengubah perilaku runtime
production yang sudah berjalan.

---

## [2026-06-12 02:15 WITA] — Inisialisasi CLAUDE.md dan CHANGELOG.md

**Author**: AI Agent (Claude) atas permintaan tim
**Apa yang dirubah**:
- Membuat file baru `CLAUDE.md` — master context project (master plan, arsitektur, tech stack,
  schema database, kredensial dev, biodata tim, instruksi wajib untuk semua AI agent).
- Membuat file baru `CHANGELOG.md` (file ini) — log seluruh perubahan sistem beserta format bakunya.

**Kenapa dirubah**:
Project dikerjakan oleh tim 4 orang yang masing-masing memakai AI agent. Dibutuhkan satu file
konteks terpusat agar AI agent pada sesi/chat baru langsung memahami seluruh project tanpa harus
membaca semua file, serta satu log perubahan terpusat agar setiap modifikasi terdokumentasi
tanpa user perlu mengingatkan.

**Before**:
- Tidak ada `CLAUDE.md` — konteks project tersebar di `README.md`, `docs/`, dan kode.
- Tidak ada `CHANGELOG.md` — riwayat perubahan hanya bisa dilacak lewat git log/PR.

**After**:
- `CLAUDE.md` berisi: identitas project, biodata 4 anggota tim (nama, NIM, peran, GitHub,
  area CODEOWNERS), tech stack, arsitektur microservices (auth-service, item-service, gateway,
  frontend, 2 PostgreSQL, cloudflared), schema lengkap 7 tabel auth_db + 1 tabel item_db,
  kredensial development, ringkasan API, RBAC 4 role, cara menjalankan, CI/CD, roadmap,
  isu yang diketahui, dan instruksi wajib agent (termasuk kewajiban mencatat ke CHANGELOG.md).
- `CHANGELOG.md` berisi format baku entri perubahan + entri pertama ini.

**Alasan melakukan perubahan**:
Konvensi `CLAUDE.md` otomatis dimuat Claude Code di setiap sesi baru, sehingga penyelarasan
konteks antar 4 AI agent terjadi tanpa langkah manual. Format changelog dibakukan
(apa/kenapa/before-after/timestamp WITA/alasan) agar dokumentasi konsisten siapapun penulisnya.
