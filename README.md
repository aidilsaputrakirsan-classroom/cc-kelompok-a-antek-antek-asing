# ☁️  Cloud App - TickTrack


## Deskripsi Proyek
TickTrack merupakan sistem internal helpdesk berbasis cloud yang dirancang untuk membantu perusahaan dalam mengelola alur pekerjaan internal secara tersturktur dan terdokumentasi. Karyawan dapat membuat serta menyelesaikan tiket pekerjaan seperti maintance, perbaikan perangkat hingga teknis lainnya, serta dapat mempermudah dalam pencatatan dan evaluasi performa karyawan dengan melalui TickTrack. 

Setiap tiket terdapat waktu pembuatan hingga penyelesaian serta seluruh aktivitas kerja yang akan dicatat dan dimonitoring secara sistematis. Dengan adanya sistem TickTrack, perusahaan dapat meningkatkan transparansi operasional, serta memastikan setiap tugas akan terdokumentasi secara terpusat sehingga supervisor dapat memonitor produktivitas harian serta mengevaluasi pencapain KPI secara lebih objektif dan berbasis data. 


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
| Railway / Render| Cloud Deployment |



## 🏗️ Architecture
```
[Client / User]
       │
     (HTTPS)
       │
       ▼
[React Frontend (Vite)]
       │
   REST API (HTTP)
       │
       ▼
[Python Backend]
 (FastAPI/Django)
       │
       ▼
[Database]
 (PostgreSQL/MYSQL)
```

**Penjelasan Arsitektur**

Client/user pengguna dapat mengakses aplikasi TickTrack melalui browser menggunakan protokol HTTPS agar memastikan komunikasi aman. 

React Frontend (Vite) berfungsi usebagai antarmuka pengguna dengan menampilakn dashboard, form input ticket, monitoring performa serta berkomunikasi dengan backend untuk mengambil dan mengirim data

Python Backend berfungsi dalam menjalankan logika bisnis aplikasi seperti autentifikasi pengguna, CRUD tiket, serta perhitungan KPI.

PostgreSQL Database berfungsi untuk menyimpan data terstruktur seperti data pengguna, data tiket, status pekerjaan serta riwayat aktivitas.

## 🚀 Getting Started

### Prasyarat
- Python 3.10+
- Node.js 18+
- Git

### Backend
```
cd backend  
pip install -r requirements.txt  
uvicorn main:app --reload --port 8000  
```
Untuk menjalankan backend, masuk ke folder backend lalu menginstall seluruh library yang dibutuhkan oleh backend. Setelan menginstall  maka uvicorn main:app --reload --port 8000  menjalankan server sehingga server dapat berjalan 

### Frontend
```
cd frontend  
npm install  
npm run dev  
```
Untuk menjalankan frontend, masuk ke folder frontend, lalu menginstall seluruh library menggunakan npm install. Aplikasi React dapat berjalan dan terhubung ke backend 

## 📅 Roadmap

| Minggu | Target                    | Status |
|--------|---------------------------|--------|
| 1      | Setup & Hello World       | ✅ |
| 2      | REST API + Database       | ⬜ |
| 3      | React Frontend            | ⬜ |
| 4      | Full-Stack Integration    | ⬜ |
| 5–7    | Docker & Compose          | ⬜ |
| 8      | UTS Demo                  | ⬜ |
| 9–11   | CI/CD Pipeline            | ⬜ |
| 12–14  | Microservices             | ⬜ |
| 15–16  | Final & UAS               | ⬜ |

### Berikut Hasil tampilan frontend yang menampilkan response dari backend API
![Foto hasil endpoint](hasil.png)

