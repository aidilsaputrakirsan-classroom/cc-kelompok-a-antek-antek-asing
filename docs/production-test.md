# Production Smoke Test — Antick Async

Dokumen ini mencatat hasil **smoke test** (verifikasi cepat fitur kritis) pada environment production setelah deployment.

**Production URLs:**
- Frontend: https://antick-async.online
- Backend API: https://api.antick-async.online
- API Docs: https://api.antick-async.online/docs

---

## Checklist Smoke Test

Lakukan pengujian berikut setelah setiap deployment ke production:

| No | Test | Endpoint / URL | Expected | Status |
|----|------|----------------|----------|--------|
| 1 | Halaman frontend load | `https://antick-async.online` | Halaman login tampil tanpa error | ✅ |
| 2 | Backend health | `https://api.antick-async.online/health` | `{"status":"healthy"}` HTTP 200 | ✅ |
| 3 | API docs accessible | `https://api.antick-async.online/docs` | Swagger UI tampil | ✅ |
| 4 | Register user baru | `POST /auth/register` | 201 Created, token returned | ✅ |
| 5 | Login dengan user tersebut | `POST /auth/login` | 200 OK, token returned | ✅ |
| 6 | Create ticket | `POST /tickets` | 201 Created | ✅ |
| 7 | Baca daftar tickets | `GET /tickets` | 200 OK, list returned | ✅ |
| 8 | Update ticket | `PUT /tickets/{id}/employee` | 200 OK | ✅ |
| 9 | Hapus ticket | `DELETE /tickets/{id}` | 200 OK | ✅ |
| 10 | Logout | `POST /auth/logout` | 200 OK | ✅ |

---

## Hasil Smoke Test

### Development vs Production

| Test | Development (localhost) | Production (antick-async.online) | Status |
|------|------------------------|----------------------------------|--------|
| Backend `/health` | ✅ | ✅ | OK |
| Register user | ✅ | ✅ | OK |
| Login | ✅ | ✅ | OK |
| Create ticket | ✅ | ✅ | OK |
| Read tickets | ✅ | ✅ | OK |
| Update ticket | ✅ | ✅ | OK |
| Delete ticket | ✅ | ✅ | OK |
| API Docs (/docs) | ✅ | ✅ | OK |

---

## Cara Menjalankan Health Check via GitHub Actions

1. Buka repository di GitHub
2. Klik tab **Actions**
3. Pilih workflow **🏥 Production Health Check**
4. Klik **Run workflow**
5. Pastikan field URL terisi: `https://api.antick-async.online/health`
6. Klik **Run workflow**
7. Tunggu hasil — cek **job summary** untuk detail HTTP status dan response body

---

## Known Issues

*(Isi bagian ini jika ditemukan masalah saat smoke test production)*

| Issue | Penyebab | Status | Solusi |
|-------|----------|--------|--------|
| — | — | — | — |
