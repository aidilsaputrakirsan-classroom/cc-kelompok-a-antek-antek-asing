# ☁️  Cloud App - Antick Async

![CI Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-antek-antek-asing/actions/workflows/ci.yml/badge.svg)

---

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

---

## Deskripsi Proyek
Antick Async merupakan sistem internal helpdesk berbasis cloud yang dirancang untuk membantu perusahaan dalam mengelola alur pekerjaan internal secara tersturktur dan terdokumentasi. Karyawan dapat membuat serta menyelesaikan tiket pekerjaan seperti maintance, perbaikan perangkat hingga teknis lainnya, serta dapat mempermudah dalam pencatatan dan evaluasi performa karyawan dengan melalui Antick Async. 

Setiap tiket terdapat waktu pembuatan hingga penyelesaian serta seluruh aktivitas kerja yang akan dicatat dan dimonitoring secara sistematis. Dengan adanya sistem Antick Async, perusahaan dapat meningkatkan transparansi operasional, serta memastikan setiap tugas akan terdokumentasi secara terpusat sehingga supervisor dapat memonitor produktivitas harian serta mengevaluasi pencapain KPI secara lebih objektif dan berbasis data. 

---
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

| Teknologi | Fungsi |
|------------|---------|
| FastAPI | Backend REST API |
| React (Vite) | Frontend SPA |
| PostgreSQL | Database |
| Docker | Containerization|
| GitHub Actions | CI/CD |
| Cloudflare Tunnel | Cloud Deployment & HTTPS |



## 🏗️ Microservices Architecture Overview
```
[Client / Browser]
        │
      (HTTPS)
        │
        ▼
[Cloudflare Tunnel]
        │
        ▼
[Nginx API Gateway (Port 80)]
   │                   │                  │
   ▼                   ▼                  ▼
/auth/*             /items/*              /
   │                   │                  │
   ▼                   ▼                  ▼
[Auth Service]      [Item Service]     [React SPA]
 (FastAPI)           (FastAPI)
   │                   │
   ▼                   ▼
[auth_db]           [item_db]
(PostgreSQL)        (PostgreSQL)
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

## 🚀 Running with Docker Compose

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



### Berikut Hasil tampilan frontend yang menampilkan response dari backend API
![Foto hasil endpoint](hasil.png)


## Week 2 Dokumentasi Hasil Pengujian API 
Base URL 
```
http://localhost:8000
```
Swagger UI
```
http://localhost:8000/docs
```
### 1. **POST /items**

Pada Endpoint ini digunakan menambahkan item baru ke database

```
{
"name": "Laptop",
"price": 15000000,
"description": "Laptop untuk cloud computing",
"quantity": 5
}
```
Status Response 
```
201 Created
``` 

URL 
```
http://127.0.0.1:8000/items

```
### 2. **GET /items**

Pada Endpoint ini digunakan untuk menampilkan daftar item 

```
{
  "total": 0,
  "items": [
    {
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 15000000,

```
Status Response 
```
200 OK
``` 

URL 
```
http://127.0.0.1:8000/items

```
### 3. **GET /items/1**

Pada Endpoint ini digunakan untuk mengembalikan detail item dengan id =1 

```
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 5,
  "id": 1,
  "created_at": "2026-03-07T06:41:33.175Z",
  "updated_at": "null"
}
```
Status Response 
```
200 OK
``` 

URL 
```
http://127.0.0.1:8000/items/1

```
### 4. **PUT/items/1**

Pada Endpoint ini digunakan untuk memperbarui Data Item.
```
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 14000000,
  "quantity": 5,
  "id": 1,
```
Status Response 
```
200 OK
``` 

URL 
```
http://127.0.0.1:8000/items/1

```

### 5. ** GET /items/1**

Pada Endpoint ini digunakan untuk menampilkan kembali data item setelah dilakukan update.
```
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 14000000,
  "quantity": 5,
  "id": 1,
```
Status Response 
```
200 OK
``` 

URL 
```
http://127.0.0.1:8000/items/1

```
### 6. **GET/items?search=laptop**

Endpoint ini digunakan untuk mencari item berdasarkan kata kunci tertentu.
```
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 14000000,
  "quantity": 5,
  "id": 1,
```
Status Response 
```
200 OK
``` 

URL 
```
http://127.0.0.1:8000/items/1?search=laptop

```

### 7. **DELETE/items/1**

Endpoint ini digunakan untuk menghapus item dari database

Status Response 
```
204
``` 
URL 
```
http://127.0.0.1:8000/items/1

```

### 8. **GET/items/1**

Endpoint ini  memastikan bahwa item yang telah dihapus tidak lagi tersedia di database.
```
"detail: "Item dengan id=1 tidak ditemukan"
```
Status Response 
```
404 Not Found
``` 
URL 
```
http://127.0.0.1:8000/items/1

```

### 9. **GET/items/stats**

Manampilkan statistik item 
Status Response 
```
404 Not Found
``` 
URL 
```
http://127.0.0.1:8000/items/stats

```

---
### Week 4 Integrasi full-stack- cors, env variables & JWT AUTH

#### ⚙️ Setup & Run

| Bagian   | Perintah |
|----------|---------|
| Backend Install | `cd backend && pip install -r requirements.txt` |
| Backend Run | `uvicorn main:app --reload` |
| Frontend Install | `cd frontend && npm install` |
| Frontend Run | `npm run dev` |

#### 🌐 Akses Aplikasi

| Service | URL |
|--------|-----|
| Backend | http://127.0.0.1:8000 |
| Swagger Docs | http://127.0.0.1:8000/docs |
| Frontend | http://localhost:5173 |

---

### 🔐 Authentication

Menggunakan JWT (JSON Web Token)

| Method | Endpoint | Deskripsi |
|--------|---------|----------|
| POST | `/auth/register` | Registrasi user |
| POST | `/auth/login` | Login & mendapatkan token |

Token di header:
```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

####  🔐 Authentication

| Method | Endpoint |
|--------|---------|
| POST | `/auth/register` |
| POST | `/auth/login` |

#### 📦 Items

| Method | Endpoint |
|--------|---------|
| GET | `/items` |
| POST | `/items` |
| PUT | `/items/{id}` |
| DELETE | `/items/{id}` |

#### 📊 Stats

| Method | Endpoint |
|--------|---------|
| GET | `/items/stats` |

---


### 🧪 Testing

#### 🔐 Authentication

| Test Case | Deskripsi | Hasil |
|----------|----------|------|
| Register User | Input email & password valid | ✅ Berhasil |
| Login User | Login dengan data benar | ✅ Berhasil mendapatkan token autentifikasi |
| Login Invalid | Data salah |sistem menolak dan menampilkan pesan error|

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

---

### ✨ Fitur Tambahan

-  Notifikasi sukses/gagal (toast/alert)
-  Loading spinner saat API call
-  Validasi input (email & password)
-  Empty state saat data kosong
---
## 📸 Test Results

Hasil testing pada modul 4 dapat dilihat di folder berikut:

[Folder Screenshot](docs/images/)

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
| 12–14  | Microservices             | ⬜ |
| 15–16  | Final & UAS               | ⬜ |



## 🐳 Docker Deployment (Modul 5)

Aplikasi ini sudah di-containerize menggunakan Docker.

**Cara Menjalankan Backend dan Frontend dengan Docker:**
1. Pastikan Docker Desktop sudah berjalan.
2. Build image backend: `docker build -t notyourkisee/cloudapp-backend:v1 ./backend`
3. Build image frontend: `docker build -t notyourkisee/cloudapp-frontend:v1 ./frontend`
4. Jalankan backend: `docker run -d --name backend -p 8000:8000 --env-file backend/.env notyourkisee/cloudapp-backend:v1`
5. Jalankan frontend: `docker run -d --name frontend -p 3000:80 notyourkisee/cloudapp-frontend:v1`
6. Akses API docs di: `http://localhost:8000/docs`
7. Akses frontend di: `http://localhost:3000`

**Verifikasi Healthcheck Backend:**
- `docker inspect --format='{{.State.Health.Status}}' backend`

<br><br>



### 📌 Progress  Aplikasi Antick Async
Pada aplikasi Antick Async sistem sudah dapat digunakan untuk proses autentikasi pengguna serta menampilkan dashboard utama sebagai aktivitas user.

## Fitur Authentication (Login & Register)

Pada implementasi fitur authentication, pengguna sudah dapat melakukan proses registrasi dan login ke dalam aplikasi.

Pada proses ini, sistem menggunakan JWT (JSON Web Token) sebagai mekanisme autentikasi. Setelah user berhasil login, sistem akan memberikan token yang digunakan untuk mengakses endpoint tertentu yang bersifat protected.

validasi input telah berhasil diterapkan, seperti:
- Validasi format email
- Validasi kekuatan password
- Penanganan error ketika data tidak valid

Dengan adanya fitur ini, sistem sudah mampu membatasi akses hanya untuk user yang terdaftar.

## Fitur Dashboard

Setelah pengguna berhasil login, sistem akan menampilkan halaman dashboard sebagai halaman utama aplikasi. Dashboard ini berfungsi sebagai pusat monitoring aktivitas user, dan saat ini sudah memiliki beberapa komponen utama, yaitu:
- Ringkasan tiket (total tiket, tiket diproses, response time, dan resolved rate)
- Form input untuk membuat tiket baru
- Visualisasi data berupa grafik aktivitas tiket
- Kategori tiket dalam bentuk chart
- Daftar tiket milik user
- Aktivitas terbaru (recent activity)


## Integrasi Frontend & Backend

Pada tahap ini, frontend dan backend sudah berhasil terintegrasi dengan baik. Frontend yang dibangun menggunakan React (Vite) seperti:
- Mengirim request ke backend melalui REST API
- Menerima response dari backend
- Menampilkan data secara dinamis di dashboard

Komunikasi antar service menggunakan format JSON dan berjalan melalui endpoint API yang tersedia di backend.

## Implementasi Docker (Containerization)

Aplikasi Antick Async telah berhasil dijalankan menggunakan Docker dengan pendekatan multi-container. Terdapat tiga container utama yang digunakan yaitu :

- Frontend Container → Menjalankan aplikasi React
- Backend Container → Menjalankan API berbasis FastAPI
- Database Container → Menggunakan PostgreSQL sebagai penyimpanan data

Ketiga container ini saling terhubung dalam satu Docker network, sehingga dapat berkomunikasi menggunakan service nama. Selain ketiga container diatas terdapat beberapa impelntasi docker yang telah berhasil seperti: 
- Port telah dikonfigurasi untuk masing-masing service
- Database menggunakan volume (pgdata) untuk menjaga data
- Environment variables digunakan untuk konfigurasi koneksi dan keamanan

📁 Project Structure
```
CC-KELOMPOK-A-ANTEK-ANTEK-ASING
│
├── backend
│   ├── __pycache__
│   ├── env
│   ├── .env
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── schemas.py
│   └── test.db
│
├── docs
│   ├── assets
│   │   └── images
│   │       ├── week1
│   │       ├── week2
│   │       └── week3
│   │
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── docker-compose.prod.yaml
│   ├── member-Muhammad-Athala-Romero.md
│   ├── member-Muhammad-Bagas-Setiawan.md
│   ├── member-Muhammad-Fikri-Haikal.md
│   ├── member-Nanda-Aulia-Putri.md
│   ├── NOTIFICATION_LIFECYCLE.md
│   ├── setup.md
│   └── test.md
│
├── frontend
│   ├── .vite
│   │   └── deps
│   │       ├── _metadata.json
│   │       └── package.json
│   │
│   ├── node_modules
│   ├── public
│   ├── src
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── scripts
│
├── .gitignore
├── docker.sh
├── wait-for-it.sh
├── Makefile
└── README.md
```