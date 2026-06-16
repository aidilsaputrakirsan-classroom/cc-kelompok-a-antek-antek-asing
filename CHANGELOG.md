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

## [2026-06-16 22:00 WITA] — Rewrite menyeluruh README.md: tech stack di awal, quick start clone-to-run, env vars akurat

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- `README.md` — ditulis ulang menyeluruh. Tambahan/perbaikan utama:
  - Tabel **Tech Stack** dipindah ke paling atas (tepat di bawah judul & badge CI),
    sebelumnya ada di tengah dokumen.
  - Section **Quick Start** baru: langkah lengkap clone → `.env` setup → build frontend
    → `docker compose up` → verifikasi → login → hot-reload dev, lengkap dengan
    peringatan dua gotcha nyata yang ditemukan tim sebelumnya: (a) `SECRET_KEY`/
    `CORS_ORIGINS` format JSON array di `.env` root (root cause auth-service
    crash-loop), (b) `npm run build` biasa memuat `frontend/.env.production` yang
    mengarah ke domain live tim (`api.antick-async.online`), bukan `localhost` — untuk
    testing lokal murni harus pakai `npm run build:dev`.
  - Section **Environment Variables** diperbaiki total: sebelumnya menyebut `.env`
    per-service (`services/auth-service/.env`, `services/item-service/.env`) yang
    **tidak sesuai struktur project sebenarnya** (satu `.env` di root, dibaca via
    `env_file`/variable substitution docker-compose).
  - Section baru: **Mode Development vs Production** (`make dev`/`make prod`/build
    biasa), **Makefile & Scripts** (daftar target + script di `scripts/`), dan
    **Troubleshooting** (5 masalah umum + solusi, diambil dari insiden nyata yang
    sudah dicatat di entri-entri CHANGELOG sebelumnya).
  - Role & RBAC, fitur utama, arsitektur (diagram mermaid), dan API endpoint summary
    disinkronkan dengan kondisi kode saat ini (termasuk endpoint baru
    `reset-password`/`delete user`, auto-role approval, dll dari sesi-sesi sebelumnya).
  - Perbaiki link dokumentasi yang sebelumnya salah nama file (`docs/ui-testing.md`
    tidak ada — diganti `docs/testing-ui-projek.md` + `docs/ui-test-results.md`;
    `docs/reliability-testing.md` sebenarnya bernama `docs/reliability-testing .md`
    dengan spasi di nama file).
  - Project Structure tree diperbarui agar mencerminkan struktur folder
    `frontend/src` (context/hooks/layouts/routes) dan `services/*` yang sebenarnya.

**Kenapa dirubah**:
Permintaan user (Lead DevOps): README harus bisa menjelaskan project secara detail dan
memandu siapa pun dari clone repo sampai berhasil running di lokal, plus tech stack
harus ditampilkan di bagian awal dokumen.

**Before**:
- README tidak menyebutkan setup `.env` sama sekali sebelum instruksi run — pembaca baru
  akan langsung gagal start `auth-service` (persis insiden yang dialami tim sendiri).
- Section "Running with Docker Compose" rusak secara markdown (ada code block nested/
  tidak ditutup dengan benar).
- Instruksi backend hanya menyebut monolith legacy (`cd backend && uvicorn main:app`)
  sebagai jalur utama, padahal kode aktif ada di `services/`.
- Tidak ada penjelasan bahwa frontend harus di-build manual dulu sebelum
  `docker compose up` (frontend Dockerfile hanya `COPY dist`).
- Tech stack ada di tengah dokumen (setelah section Tim), tidak di awal.
- Beberapa link dokumentasi 404 karena nama file salah/berbeda.

**After**:
- Kontributor baru bisa clone → copy `.env.example` → isi `SECRET_KEY`/password → build
  frontend → `docker compose up --build -d` → langsung jalan, tanpa perlu menebak-nebak
  atau mengulang kegagalan yang sudah pernah dialami tim.
- Tech stack tampil di paragraf kedua, langsung di bawah judul.
- Semua link dokumentasi diverifikasi mengarah ke file yang benar-benar ada di `docs/`.
- Verifikasi: dibaca ulang heading-by-heading memastikan semua entri Table of Contents
  punya section yang sesuai; tidak ada perubahan kode (`.md` only), tidak perlu rebuild
  Docker.

**Alasan melakukan perubahan**:
README adalah pintu masuk pertama siapa pun yang baru clone repo — kegagalan setup yang
sudah dialami tim sendiri (SECRET_KEY kosong, CORS_ORIGINS format salah, frontend/dist
basi, build mode salah memanggil API production) seharusnya tidak terulang ke anggota
tim lain atau penilai/reviewer eksternal hanya karena tidak terdokumentasi. Konten env
vars dan struktur project ditulis ulang berdasarkan pengecekan langsung ke
`docker-compose.yml`/`.env.example`/`Makefile` saat ini (bukan disalin dari versi README
lama yang sudah usang), supaya akurat terhadap kondisi repo saat ini.

---

## [2026-06-16 21:15 WITA] — Perbesar animasi Lottie, metrics hanya catat error kritis (5xx), modal konfirmasi global

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- `frontend/src/pages/StatusPage.jsx` — animasi mood card API Gateway diperbesar 2x
  (dari `h-20 w-20` jadi `h-40 w-40`) dengan posisi `absolute` (bukan flow normal) di
  dalam card yang sudah `relative overflow-hidden`, sehingga ukuran box card tidak
  berubah walau animasinya lebih besar (overflow otomatis ter-crop oleh card).
- `services/shared/metrics.py` (+ disinkronkan ke `services/auth-service/shared/metrics.py`
  dan `services/item-service/shared/metrics.py`) — `MetricsCollector` sekarang hanya
  menghitung status code **>= 500** sebagai "error" (sebelumnya >= 400). Ini memengaruhi
  `error_count`, `error_rate_percent`, dan ambang alert internal di seluruh service.
- `frontend/src/context/ConfirmContext.jsx` — **file baru**: `ConfirmProvider` +
  `useConfirm()` hook, modal konfirmasi reusable di tengah halaman dengan animasi
  ringan (fade + scale-in saat muncul, scale-out saat menutup), tombol Confirm bertema
  `danger` (merah) untuk aksi destruktif atau `primary` (biru) untuk aksi non-destruktif.
- `frontend/src/App.jsx` — daftarkan `ConfirmProvider` di pohon provider root.
- `frontend/src/pages/AdminDashboardPage.jsx`, `AdminPendingUsersPage.jsx`,
  `ItemsPage.jsx` — ganti semua `window.confirm(...)` (dialog browser native) dengan
  `await confirm({...})` dari `useConfirm()`: hapus kategori, hapus departemen, reset
  password user, hapus user (single & bulk), reject pending user, hapus item.

**Kenapa dirubah**:
Permintaan user: (1) animasi kucing di card API Gateway terlalu kecil, minta 2x lebih
besar tapi card jangan ikut membesar; (2) laporan bug fitur reset password — setelah
investigasi (lihat bagian "Investigasi" di bawah), **tidak ditemukan data hilang**;
(3) halaman System Status mencatat error 4xx (login salah, dst) yang membuatnya
terlihat seperti banyak error padahal bukan kegagalan sistem — minta hanya error kritis
yang membuat sistem tidak berjalan yang dicatat; (4) semua aksi konfirmasi (delete,
reset password, reject) masih pakai `window.confirm()` browser bawaan yang tidak
konsisten dengan desain aplikasi — minta modal kustom di tengah halaman dengan animasi.

**Investigasi bug "reset password menghapus semua data" (poin 2)**:
Dicek langsung ke database production via API setelah laporan masuk: `GET /users` →
total tetap **7 user**, `GET /tickets` → total tetap **4 tiket**, seluruh field
(nama, role, department, requester, assignee, timestamp) masih sama seperti sebelum
fitur reset password dipakai. Kode `crud.reset_user_password()` dan
`crud.delete_user()` keduanya di-scope ketat via `WHERE id = :user_id` (ORM, primary
key) — tidak ada query yang menyentuh tabel lain atau row lain. **Tidak ditemukan bug
yang menyebabkan data hilang di level backend/database.** Kemungkinan yang teramati
user adalah salah satu dari: tampilan filter/halaman yang berubah sesaat, atau cache
browser yang menampilkan state lama. **Belum ada perubahan kode untuk poin ini** —
butuh langkah reproduksi yang lebih spesifik (akun mana yang di-reset, halaman apa yang
terlihat "ter-reset") untuk lanjut investigasi kalau bug ini muncul lagi.

**Before**:
- Animasi mood gateway `h-20 w-20` dalam flow normal dokumen (ikut mendorong tinggi
  card kalau diperbesar).
- `is_error = status_code >= 400` — error rate ikut menghitung 401 (login salah,
  token expired) dan 404/422 sebagai "error", membuat metric terlihat lebih buruk dari
  kondisi sistem yang sebenarnya.
- Semua konfirmasi pakai `window.confirm()` — dialog browser polos, tidak bisa
  di-styling, tidak konsisten dengan desain dark/light mode aplikasi.

**After**:
- Animasi mood gateway 160×160px (2x), posisi absolute di dalam card yang
  `overflow-hidden` — ukuran card di grid tidak berubah.
- Hanya status code 5xx (Internal Server Error, dst — kegagalan sistem nyata) yang
  dihitung sebagai error di `/auth/metrics` dan `/items/metrics`. Diverifikasi:
  `error_count: 0` segera setelah rebuild (tidak ada 5xx terjadi), behavior 4xx
  (login salah dll.) tetap sama dari sisi user, hanya tidak lagi memengaruhi metric.
- Semua titik konfirmasi (7 lokasi di 3 halaman) pakai modal kustom terpusat dengan
  animasi fade+scale, ikon kontekstual (warning untuk destructive, help untuk lainnya),
  dan tombol bertema sesuai tingkat risiko aksi.
- Verifikasi: `npm run build` sukses, `npm test` 19/19 lolos, data production
  diverifikasi tetap 7 user + 4 tiket setelah rebuild & restart container, image
  frontend/auth-service/item-service di-rebuild dan semua container healthy.

**Alasan melakukan perubahan**:
Posisi `absolute` dipilih (bukan ubah ukuran lalu kompensasi margin negatif) karena
lebih predictable — ukuran card ditentukan murni oleh konten metrics, bukan ikut
terpengaruh ukuran animasi dekoratif. Ambang error diturunkan ke 5xx saja karena status
4xx pada arsitektur REST ini representasi error di sisi client/permintaan (kredensial
salah, validasi gagal, dsb), bukan indikasi backend/infrastruktur gagal — selaras
dengan tujuan halaman Status sebagai indikator kesehatan *sistem*, bukan log audit
semua request. Modal konfirmasi dibuat sebagai context/hook tunggal (bukan duplikasi
modal di setiap halaman) supaya konsisten dan mudah dipakai ulang di fitur mendatang;
nama file dan pola peniruan sengaja mengikuti `useToast.js` yang sudah ada di project
agar gaya kode konsisten.

---

## [2026-06-16 20:30 WITA] — Bulk delete & reset password user, debug error System Status, animasi mood Lottie API Gateway

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- `services/auth-service/crud.py` — tambah `reset_user_password()` (set password ke default
  `Password123!` + `must_change_password=True`) dan `delete_user()` (hard delete, dengan
  exception `UserHasRelatedDataError` kalau ada FK constraint dari tiket/approval log).
- `services/auth-service/main.py` — endpoint baru `POST /admin/users/{id}/reset-password`
  dan `DELETE /admin/users/{id}`, dengan guard sama seperti `update_user_role` (tidak bisa
  ke akun sendiri; admin tidak bisa reset/hapus admin lain atau superadmin).
- `frontend/src/services/api.js` — tambah `adminApi.resetUserPassword()` dan
  `adminApi.deleteUser()`.
- `frontend/src/pages/AdminDashboardPage.jsx` — tab Team Member (`/admin?tab=users`):
  tambah checkbox per baris + "select all", tombol **Delete Selected** (bulk, muncul saat
  ada baris terpilih) dan per-baris tombol **Reset Password** (icon kunci) serta **Delete**
  (icon trash), masing-masing dengan konfirmasi `window.confirm`.
- `frontend/src/pages/StatusPage.jsx` + `frontend/package.json` — tambah dependency
  `lottie-react`; card **API Gateway** sekarang menampilkan animasi mood: file
  `public/lottie/cat-love.json` saat status healthy, `public/lottie/cat-crying.json` saat
  tidak healthy (file JSON dipindah dari root `frontend/` ke `frontend/public/lottie/` agar
  bisa di-fetch sebagai aset statis, bukan di-bundle ke JS).

**Kenapa dirubah**:
Permintaan user: (1) bulk delete user, (2) admin/superadmin bisa reset password karyawan
yang lupa password ke default `Password123!`, (3) `/debug` kenapa System Status
menampilkan beberapa error, (4) animasi Lottie reaktif status di card API Gateway.

**Hasil debug System Status (poin 3, tidak ada perubahan kode)**:
Dicek langsung lewat `GET /auth/metrics` di server live: `error_count: 5` dari
`request_count: 1590` (`error_rate_percent: 0.31%`). Breakdown per endpoint
(`endpoint_stats`): `POST /login` 3 error dari 9 request, `GET /notifications` 2 error dari
1320 request. **Kesimpulan: bukan bug** — 3 error login adalah percobaan login dengan
password salah (perilaku normal 401), 2 error notifications kemungkinan polling
(interval 5 detik di `useNotifications.js`) yang kena 401 saat token JWT expired
(`ACCESS_TOKEN_EXPIRE_MINUTES=60`) menjelang user logout/refresh manual. Seluruh
health-check (`/health`, `/auth/health`, `/items/health`) dan CORS preflight ke
`https://antick-async.online` terverifikasi normal. Angka error kecil ini yang sebelumnya
tampak sebagai "undefined" (lihat entri sebelumnya) sekarang tampil sebagai persentase
kecil yang benar (0.3%), bukan indikasi outage.

**Before**:
- Tidak ada cara menghapus atau reset password user dari UI maupun API — admin harus akses
  database langsung kalau karyawan lupa password atau perlu dihapus.
- Card API Gateway di `/status` hanya menampilkan badge teks status, tanpa elemen visual
  tambahan.

**After**:
- Admin/superadmin bisa pilih beberapa user lalu hapus sekaligus (bulk), atau reset
  password / hapus satu user lewat tombol di baris tabel. Percobaan manual (ID tidak ada,
  reset/hapus akun sendiri) mengembalikan 404/403 sesuai ekspektasi tanpa menyentuh data
  user asli.
- Card API Gateway menampilkan animasi kucing menangis saat tidak healthy, kucing
  senang saat healthy — fetch JSON dari `/lottie/*.json` (terverifikasi 200 OK).
- Verifikasi: `npm run build` sukses, `npm test` 19/19 lolos, image frontend & auth-service
  di-rebuild dan container direstart, semua healthy.

**Alasan melakukan perubahan**:
`delete_user` memakai hard delete (sesuai instruksi "hapus data") tapi dibungkus
try/except `IntegrityError` supaya kalau user punya tiket/approval log terkait, error yang
dikembalikan jelas (409 + pesan) bukan 500 generik dari DB. Reset password memakai
`must_change_password=True` (kolom yang sudah ada di schema) agar user dipaksa ganti
password default saat login pertama setelah reset — konsisten dengan flow approval user
baru yang sudah ada. File Lottie dipindah ke `public/` dan di-fetch saat runtime (bukan
di-`import` ke JS) karena ukurannya besar (787KB + 149KB) — supaya tidak membengkakkan
bundle JS utama yang sudah di atas batas peringatan Vite.

---

## [2026-06-16 19:30 WITA] — Fix badge priority "low" di dark mode, metrics System Status undefined, dan filter tiket admin

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- `frontend/src/components/StatusBadge.jsx` — ganti warna badge priority `low` dari
  `bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300` (kontras sangat rendah
  di dark mode, terlihat seperti transparan) menjadi `bg-teal-100 dark:bg-teal-900/30
  text-teal-800 dark:text-teal-400` — pola warna konsisten dengan badge status/priority lain.
- `services/shared/metrics.py` (+ disinkronkan ke `services/auth-service/shared/metrics.py`
  dan `services/item-service/shared/metrics.py`) — `MetricsCollector` sekarang menghitung dan
  mengembalikan `error_rate_percent`, `uptime_seconds` (sejak proses start), dan
  `latencies_ms.avg` — field yang sebelumnya tidak ada sama sekali di response `/metrics`.
- `frontend/src/pages/StatusPage.jsx` — perbaiki mapping field metrics yang sebelumnya
  salah total (field frontend `total_requests`/`total_errors`/`latency.avg_ms`/dst tidak
  pernah ada di response backend yang sebenarnya `request_count`/`error_count`/
  `latencies_ms.avg`/dst) → root cause "Error Rate: undefined%" dan metric lain kosong.
  Tambah `formatUptime()` agar uptime ditampilkan "Xh Ym" bukan cuma menit kasar.
- `frontend/src/pages/AdminDashboardPage.jsx` — tab Tickets: pisahkan state filter draft
  (`filterDraft`, diisi user) dari filter yang benar-benar diterapkan (`appliedFilters`,
  dipakai `filteredTickets`); tambah tombol **Apply Filter** yang menyalin draft →
  applied; tombol **Reset Filter** sekarang reset keduanya; urutan kolom filter ditukar
  jadi **Priority lalu Status** (sebelumnya Status lalu Priority).

**Kenapa dirubah**:
Permintaan user berdasarkan pengamatan langsung di https://antick-async.online: (1) badge
priority "low" nyaris tidak terlihat di dark mode, (2) halaman `/status` menampilkan
"Error Rate: undefined%" dan metric latency/uptime kosong padahal diharapkan data realtime,
(3) filter tiket admin langsung jalan tiap ketik/pilih opsi, ingin ada tombol Apply, dan
urutan kolom Priority/Status ditukar.

**Before**:
- Badge `low` pakai `slate` netral dengan opacity tipis di dark mode → blend dengan
  background card, sulit dibaca.
- Backend `/metrics` hanya pernah mengembalikan `request_count`, `error_count`,
  `latencies_ms: {p50,p95,p99,samples}`, `endpoint_stats` — **tidak pernah** ada
  `error_rate_percent`, `uptime_seconds`, atau `latencies_ms.avg`. Frontend StatusPage.jsx
  membaca nama field yang sama sekali berbeda (`total_requests`, `total_errors`,
  `latency.avg_ms`, dst) → semua bernilai `undefined`, tampil sebagai teks "undefined%"/
  "undefinedms"/"NaN min".
- Filter tiket admin (`search`/`status`/`priority`/`assignee`) langsung memfilter tabel
  tiap kali state berubah — tidak ada tombol apply, urutan kolom Status dulu baru Priority.

**After**:
- Badge `low` terlihat jelas di light maupun dark mode (warna teal, pola sama seperti badge
  lain).
- `GET /auth/metrics` dan `GET /items/metrics` sekarang benar-benar mengembalikan
  `error_rate_percent`, `uptime_seconds`, dan `latencies_ms.avg` terhitung real-time dari
  data request yang sudah masuk. Diverifikasi manual: `auth-service` mengembalikan
  `error_rate_percent: 0.0`, `uptime_seconds: 19.96`, `latencies_ms.avg: 15.82` (bukan lagi
  `undefined`).
- Halaman `/status` menampilkan Error Rate/Avg Latency/p95 Latency/Uptime dengan nilai asli
  dari backend, refresh otomatis tiap 10 detik tetap berjalan.
- Tab Tickets admin: input filter tidak langsung memfilter — user mengisi lalu klik
  **Apply Filter** untuk menjalankannya; **Reset Filter** mengembalikan draft & hasil filter
  ke kosong; kolom filter tampil **Priority** lebih dulu, baru **Status**.
- Verifikasi: `npm run build` sukses, `npm test` 19/19 lolos, image frontend +
  auth-service + item-service di-rebuild dan container direstart, semua healthy.

**Alasan melakukan perubahan**:
`metrics.py` diduplikasi di 3 lokasi sesuai catatan §4 CLAUDE.md — ketiganya disinkronkan
ulang agar tidak ada drift. Perhitungan `error_rate_percent`/`uptime_seconds`/`avg` dipilih
ringan (in-memory, tanpa dependensi baru) konsisten dengan pendekatan `MetricsCollector`
yang sudah ada, bukan mengganti ke sistem metrics eksternal. Filter draft/applied
dipisah dengan state baru daripada menambah flag tunggal, agar Reset Filter tetap bisa
mengosongkan kedua sisi secara eksplisit tanpa efek samping ke komponen lain yang sudah
memakai pola `filters`.

---

## [2026-06-16 18:40 WITA] — Fix 5 bug/permintaan halaman admin (role edit, pending-users, status menu, tickets toolbar)

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- `frontend/src/pages/AdminDashboardPage.jsx`:
  - Fix dropdown role di tab `users` (`/admin?tab=users`) yang `value`-nya ter-bind ke
    `item.role` (data asli) bukan state lokal `departmentEditMode.role`, sehingga teks
    placeholder dropdown tidak berubah sampai diklik Save.
  - Hapus `"superadmin"` dari `roleOptions` — admin tidak lagi bisa memilih role superadmin
    lewat dropdown ini.
  - Tambah button **Reset Filter** dan **Refresh** di toolbar tab `tickets`.
- `frontend/src/pages/AdminPendingUsersPage.jsx` — setelah approve user pending, otomatis
  panggil `adminApi.updateUserRole`: departemen **IT** → role `it_employee`, departemen
  lain → role `employee`.
- `frontend/src/layouts/AppShell.jsx` — hapus item sidebar "System Status" dari menu
  `it_employee` dan `employee` (hanya tersisa di menu `admin`/`superadmin`).
- `frontend/src/App.jsx` — bungkus route `/status` dengan
  `<ProtectedRoute allowedRoles={["superadmin","admin"]} />` agar akses langsung via URL
  juga diblokir untuk role lain (sebelumnya hanya disembunyikan dari sidebar, tetap bisa
  diakses kalau tahu URL-nya).

**Kenapa dirubah**:
Permintaan user (Lead DevOps) berdasarkan pengamatan langsung di
https://antick-async.online — 5 poin: (1) bug placeholder role di edit user,
(2) hilangkan opsi superadmin di dropdown role, (3) auto-assign role saat approve user
pending berdasarkan departemen, (4) batasi akses menu System Status, (5) tambah tombol
refresh & reset filter di tab tickets.

**Before**:
- Dropdown role di tab users menampilkan role lama walau sudah diganti, sampai user klik
  tombol Save (centang) — root cause: `value={item.role}` bukan state draft.
- `roleOptions` memuat `superadmin`, admin bisa (tidak sengaja) menaikkan user lain ke
  superadmin dari UI ini.
- Approve user pending hanya set `department_id`, role user tidak berubah dari default
  (`employee`) walau ditempatkan ke departemen IT.
- Menu "System Status" tampil di sidebar semua role, dan `/status` bisa diakses oleh
  role apa pun selama login (tidak ada `allowedRoles` guard).
- Tab tickets admin tidak punya tombol refresh manual maupun reset filter cepat.

**After**:
- Dropdown role di mode edit langsung menampilkan pilihan yang baru dipilih sebelum Save.
- `roleOptions` = `["employee", "it_employee", "admin"]` saja.
- Approve user dengan departemen "IT" otomatis set role `it_employee`; departemen lain
  otomatis `employee`.
- Sidebar "System Status" hanya muncul untuk admin/superadmin; akses langsung ke `/status`
  oleh role lain di-redirect (employee → `/employee`, it_employee → `/admin`).
- Tab tickets admin punya tombol "Reset Filter" (clear semua filter) dan "Refresh"
  (re-fetch `loadData()`).
- Verifikasi: `npm run build` sukses, `npm test` 19/19 lolos, image frontend di-rebuild
  dan container direstart (asset hash baru `index-CFNdSfs7.js`), `GET /` 200.

**Alasan melakukan perubahan**:
Semua perbaikan dilakukan minimal di titik akar masalah (binding state, filter array,
guard route) tanpa mengubah struktur komponen secara luas. Auto-assign role di approval
diimplementasikan di frontend (memanfaatkan endpoint `PUT /users/{id}/role` yang sudah
ada) tanpa mengubah skema/endpoint backend approval, supaya scope perubahan tetap kecil
dan backward-compatible dengan flow approval yang sudah berjalan.

---

## [2026-06-16 18:05 WITA] — Pull `main` (merge PR #31 dari `bagas-frontend`) & rebuild frontend + auth-service

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- Tidak ada perubahan source code baru oleh saya — operasional: `git pull origin main`
  (fast-forward gagal karena `CHANGELOG.md` berubah di kedua sisi, jadi merge manual:
  gabungkan entri baru saya dengan entri Copilot "Fix CI frontend test job" yang masuk
  lewat PR #31, tanpa kehilangan salah satu); commit merge `54a2224`.
- Setelah pull, jalankan ulang `npm ci && npm run build` (frontend — banyak file di
  `frontend/src/**`, `frontend/public/**`, font, dan komponen UI baru berubah dari PR #31)
  lalu `docker compose build frontend && docker compose up -d frontend`.
- `services/auth-service/crud.py` dan `main.py` juga berubah di PR #31 → rebuild &
  restart `auth-service` juga (`docker compose build auth-service && docker compose up -d
  auth-service`) agar behavior backend ikut sinkron, bukan cuma tampilan.

**Kenapa dirubah**:
PR #31 (merge branch `bagas-frontend` ke `main`) membawa banyak perubahan UI (font Lufga,
logo baru, halaman dashboard/login/register/profile, `CardSpotlight.jsx` baru, dll.) plus
perubahan kecil di `auth-service`. Server akses (laptop ini) harus disinkronkan supaya
tampilan & behavior yang dilihat user benar-benar versi terbaru `main`, bukan versi sebelum
merge.

**Before**:
- Local `main` di commit `0c21438`/`cb84bc1`, tertinggal 6 commit dari `origin/main`
  (`2b0d2a6`). `frontend/dist` dan image `auth-service` jalan masih berdasarkan kode sebelum
  PR #31.

**After**:
- `main` lokal di `54a2224` (merge commit), 2 commit di depan `origin/main` (entri
  CHANGELOG lokal + merge) — belum di-push.
- `frontend/dist` di-build ulang (asset baru `index-BZKTwW77.js`), image frontend &
  auth-service di-rebuild dan container direstart. Diverifikasi: 7/7 container
  healthy/running, `/health`, `/auth/health`, `/items/health` semua 200, dan hash asset JS
  di HTML yang disajikan gateway cocok dengan output build terbaru.

**Alasan melakukan perubahan**:
Konflik `CHANGELOG.md` diselesaikan dengan menggabungkan (bukan menimpa) kedua entri karena
keduanya sah dan independen — sesuai aturan §1 CLAUDE.md bahwa setiap perubahan harus tetap
tercatat. Auth-service ikut di-rebuild meski permintaan awal hanya soal tampilan frontend,
karena PR yang sama juga mengubah backend — membiarkan auth-service jalan dengan image lama
berisiko perilaku tidak konsisten dengan kode `main` saat ini.

---

## [2026-06-16 17:45 WITA] — Rebuild frontend lokal agar sinkron dengan production (commit terbaru `main`)

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- Tidak ada perubahan source code — operasional saja: `git fetch origin` (konfirmasi `main`
  lokal sudah sama dengan `origin/main` di commit `0c21438`), `cd frontend && npm ci`,
  `npm run build` (regenerate `frontend/dist` dari source terbaru, pakai `.env.production`
  yang sudah ada), lalu `docker compose build frontend && docker compose up -d frontend`.

**Kenapa dirubah**:
Tampilan frontend di laptop ini (server akses) terlihat beda versi dibanding yang seharusnya,
karena `frontend/dist` yang di-copy oleh `frontend/Dockerfile` adalah hasil build lama
(file terakhir bertanggal 15 Mei), bukan hasil build dari commit terbaru `main` (`#30`,
`#29`, dst). Dockerfile frontend sengaja **tidak** build di dalam Docker (komentar di
`Dockerfile`: "untuk menghindari OOM" di VPS kecil) — build harus dilakukan manual
sebelum `docker compose up`.

**Before**:
- `frontend/dist` stale (build lama), container `antick-async-frontend` menyajikan UI versi
  lama meski source code repo sudah terbaru.

**After**:
- `main` lokal terkonfirmasi up to date dengan `origin/main` (tidak perlu pull/merge).
- `frontend/dist` di-regenerate, asset hash baru (`index-BtpQMLP4.js`, dll). Image
  `notyourkisee/antick-async-frontend:latest` di-rebuild dan container direstart.
  Diverifikasi: `GET /` 200, asset hash di HTML cocok dengan output build terbaru.

**Alasan melakukan perubahan**:
Mengikuti instruksi Dockerfile yang sudah ada (build-lokal-lalu-copy) tanpa mengubah
arsitektur deployment. Tidak ada perubahan kode, hanya memastikan artifact build (`dist`)
sinkron dengan commit terbaru — sesuai permintaan user untuk menyamakan tampilan lokal
dan production.

---

## [2026-06-16 17:10 WITA] — Fix `.env` lokal: auth-service crash-loop karena SECRET_KEY kosong & CORS_ORIGINS format salah

**Author**: AI Agent (Claude) atas permintaan Muhammad Fikri Haikal Ariadma
**Apa yang dirubah**:
- `.env` (root, tidak di-commit) — tambah `SECRET_KEY` (random 48-byte, di-generate via
  `secrets.token_urlsafe`), `ENVIRONMENT`, `LOG_LEVEL`, `POSTGRES_PASSWORD` (default dev),
  `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`; ubah `CORS_ORIGINS` dari format comma-separated
  ke format JSON array (`["...","..."]`); hapus baris duplikat `SUPERADMIN_PASSWORD`.
- `.env.example` (root) — perbaiki dokumentasi `CORS_ORIGINS`: ganti contoh dari
  comma-separated ke JSON array + tambah komentar penjelasan, agar member lain tidak
  mengalami crash-loop yang sama saat setup.

**Kenapa dirubah**:
`docker compose up -d --build` di laptop ini (yang berfungsi sebagai server akses production,
terhubung ke Cloudflare Tunnel asli) gagal — `auth-service` crash-loop terus, gateway &
cloudflared tidak pernah start karena dependency healthcheck.

**Before**:
- `.env` hanya berisi `TUNNEL_TOKEN` + `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` (duplikat 2x).
  `SECRET_KEY` kosong → `services/auth-service/config.py` (`Settings.validate_secret_key`)
  fail-fast dengan `ValidationError`, container auth-service exit terus-menerus →
  `item-service`, `gateway`, `cloudflared` tidak pernah naik (dependency chain).
- Setelah `SECRET_KEY` ditambahkan, percobaan kedua gagal lagi: `CORS_ORIGINS` ditulis format
  comma-separated (sesuai `.env.example`), tapi `pydantic-settings` mencoba JSON-decode field
  bertipe `List[str]` **sebelum** custom `field_validator` jalan → `SettingsError` saat parsing
  env source, bukan validation error biasa.

**After**:
- `docker compose up -d --build` sukses: 7/7 container `healthy`/`running` —
  `auth-db→auth-service→item-db→item-service→gateway→cloudflared` naik penuh sesuai
  healthcheck chain di CLAUDE.md §10. Diverifikasi: `GET /health` (gateway), `/auth/health`,
  `/items/health` semua 200 `"status":"healthy"`; frontend `/` 200; `/items` tanpa token 401
  (auth guard bekerja).

**Alasan melakukan perubahan**:
`.env` adalah file rahasia per-mesin (gitignored) sehingga tidak ada cara mengetahui isinya
sebelum dicoba jalankan — perbaikan dilakukan reaktif berdasarkan error log container.
`.env.example` di repo **menyesatkan** untuk format `CORS_ORIGINS` (comma-separated tidak
valid untuk versi `pydantic-settings` yang dipakai project ini); perlu dipertimbangkan untuk
diperbaiki di `.env.example` agar setup member lain tidak mengalami masalah yang sama.
Catatan tambahan: ditemukan ingress Cloudflare Tunnel (dikelola di dashboard, bukan di repo)
masih mengarah `api.antick-async.online → http://backend:8000` (nama service monolith lama),
seharusnya `http://gateway:80` sesuai CLAUDE.md §11 — perlu diperbaiki di dashboard Cloudflare.

---

## [2026-06-15 16:58 WITA] — Fix CI frontend test job by syncing npm lockfile

**Author**: AI Agent (Copilot)
**Apa yang dirubah**:
- `frontend/package-lock.json` — disinkronkan ulang dengan `frontend/package.json` menggunakan `npm install` agar dependency tree konsisten untuk `npm ci`.
- `CHANGELOG.md` — menambahkan entri perubahan ini.

**Kenapa dirubah**:
GitHub Actions job **⚛️ Test Frontend** gagal di langkah `npm ci` karena lockfile tidak sinkron dengan dependency yang ada di `package.json`.

**Before**:
- CI gagal dengan error `npm ci` EUSAGE dan daftar dependency yang "Missing from lock file" (mis. `@testing-library/dom@10.4.1`, `dom-accessibility-api@0.5.16`, `pretty-format@27.5.1`, dll).
- Akibatnya test dan build frontend tidak dijalankan di CI.

**After**:
- `npm ci` berjalan normal.
- Validasi lokal frontend berhasil: `npm ci`, `npm test` (7 files, 19 tests passed), dan `npm run build` sukses.

**Alasan melakukan perubahan**:
Perbaikan paling kecil dan tepat sasaran untuk kasus ini adalah meregenerasi lockfile agar sesuai dengan `package.json`, tanpa mengubah source code aplikasi. Ini memulihkan alur CI existing secara aman dan backward-compatible.

---

## [2026-06-12 11:30 WITA] — Fix layout form "Tambah Item Baru" yang meluber di halaman /items

**Author**: Muhammad Fikri Haikal Ariadma — dikerjakan via AI Agent (Claude)
**Apa yang dirubah**:
- `frontend/src/components/ItemForm.jsx` — perbaikan CSS inline pada `styles.row`,
  `styles.field`, `styles.input`, dan `styles.actions`.

**Kenapa dirubah**:
Bug visual di production https://antick-async.online/items: input "Harga (Rp)" dan
"Jumlah Stok" meluber keluar kartu form dan menimpa area daftar item.

**Before**:
- `row` = flex tanpa `flexWrap`; `field` = `flex: 1` tanpa `minWidth: 0`; input tanpa
  `width: 100%` + `boxSizing: border-box`. Karena input HTML punya lebar intrinsik
  minimum (~170px), dua field berdampingan tidak bisa menyusut di kolom sempit
  (`lg:col-span-4`, ±350px) → overflow keluar kartu.

**After**:
- `row` pakai `flexWrap: wrap`; `field` pakai `flex: 1 1 160px` + `minWidth: 0`
  (berdampingan saat lebar cukup, turun ke baris baru saat sempit); input
  `width: 100%` + `boxSizing: border-box`; `actions` ikut `flexWrap`.
- Verifikasi: Vitest 19/19 lolos (termasuk `ItemForm.test.jsx`), `vite build` sukses.

**Alasan melakukan perubahan**:
Perbaikan minimal di sumber masalah (CSS form) tanpa menyentuh struktur grid halaman,
sehingga perilaku di layar lebar tetap sama dan hanya kondisi sempit yang berubah
(wrap, bukan overflow).

---

## [2026-06-12 10:50 WITA] — Modul 15 (porsi DevOps): secret audit, fix healthcheck gateway, restore production, verify script

**Author**: Muhammad Fikri Haikal Ariadma (Lead DevOps) — dikerjakan via AI Agent (Claude)
**Apa yang dirubah**:
- `docker-compose.yml` — (a) **fix healthcheck gateway**: `wget http://localhost/health` →
  `http://127.0.0.1/health`; (b) password PostgreSQL diparametrisasi:
  `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres123}` + DATABASE_URL kedua service
  ikut substitusi (4 lokasi).
- `.env.example` (root) — ditulis ulang: hapus `DATABASE_URL` monolith basi, ganti
  `ALLOWED_ORIGINS` → `CORS_ORIGINS` (nama yang benar sesuai config), tambah
  `ENVIRONMENT`/`LOG_LEVEL`/`POSTGRES_PASSWORD`, dan **ganti password superadmin asli
  yang bocor dengan placeholder**.
- `scripts/verify-deployment.sh` — **file baru**: verifikasi menyeluruh (container,
  health, metrics, frontend, auth guard) untuk lokal maupun production URL.
- Operasional (bukan file): stack production di-restart penuh — 7/7 container healthy,
  https://antick-async.online & api 200 semua.

**Kenapa dirubah**:
Workshop 15.1 (secret audit) + Tugas Terstruktur Modul 15 DevOps ("pastikan deployment
production running" + deployment verify). Rate limiting gateway (fokus DevOps lain) sudah
terpasang sejak sebelumnya sehingga tidak disentuh.

**Before**:
- Healthcheck gateway gagal permanen saat container dibuat ulang: nginx hanya listen IPv4
  (entrypoint gagal menambah listener IPv6 karena config di-mount read-only), sedangkan
  busybox wget me-resolve `localhost` → `::1` tanpa fallback → gateway "unhealthy" →
  cloudflared tidak pernah start → **seluruh domain production 503**. Ditemukan saat
  deployment verify: item-service/gateway/tunnel ter-stop manual, dan stack tidak bisa
  naik penuh karena bug ini.
- Password DB `postgres123` hardcoded di 4 tempat di docker-compose.yml.
- `.env.example` root menyesatkan (var salah nama, URL monolith) dan **memuat password
  superadmin production asli** — pelanggaran checklist "placeholder, bukan nilai asli".
- Tidak ada script verifikasi menyeluruh untuk persiapan demo UAS.

**After**:
- `docker compose up -d` menghasilkan 7/7 container healthy; healthcheck chain sampai
  cloudflared bekerja; production live terverifikasi end-to-end (frontend 200,
  gateway/auth/item health 200, metrics 200, `/items` tanpa token 401).
- Password DB bisa diganti via `.env` (`POSTGRES_PASSWORD`), default dev tetap
  `postgres123` → backward compatible, tidak ada perubahan perilaku tanpa .env.
- `./scripts/verify-deployment.sh [base-url]` lolos 100% untuk lokal dan production.

**Alasan melakukan perubahan**:
`127.0.0.1` menghindari ambiguitas resolusi IPv6 di healthcheck tanpa mengubah perilaku
nginx. Parametrisasi password memakai default fallback agar VPS yang `.env`-nya belum punya
`POSTGRES_PASSWORD` tetap jalan identik (risiko nol). Password superadmin yang sudah
terlanjur bocor di riwayat git repo classroom sebaiknya **diganti nilainya di production**
(ubah `SUPERADMIN_PASSWORD` di `.env` lalu reset akun) — dicatat sebagai isu di CLAUDE.md.

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
