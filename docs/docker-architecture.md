# Docker Architecture

## Deskripsi
Pada dokumen ini, menjelaskan mengenai arsitektur untuk aplikasi antick async dengan menggunakan arsitektur 3 container yang terdiri dari frontend, backend, dan database.  

Semua container terhubung dalam satu Docker network sehingga dapat saling berkomunikasi.

---

## 📊 Diagram Arsitektur

```mermaid
flowchart TB

User["👤 User / Browser"]

subgraph HOST["🖥️ Docker Host"]
    
    subgraph NET["🌐 Docker Network (cloudnet)"]

        FE["antick-frontend  
        Nginx  
        Port: 3000"]

        BE["antick-backend  
        FastAPI  
        Port: 8000"]

        DB[(" antick-db  
        PostgreSQL  
        Port: 5433")]

    end

end

VOL[(" pgdata  
Docker Volume")]

User -->|"HTTP (Port 3000)"| FE
FE -->|"REST API"| BE
BE -->|"SQL Connection"| DB
DB -->|"Persist Data"| VOL

```
---
## 📦 Detail Komponen
1. Frontend Container
Frontend digunakan untuk mengakses tampilan aplikasi melalui browser dan user mengakases aplikasi melalui' http://localhost:3000' tampilan pada frontend dapat menampilkan data, menerima input serta dapat mengirimkan request ke backend
2. Backend Container
Backend berperan sebagai pusat logika aplikasi dan bertanggung jawab untuk  memproses setiap request yang datang dari frontend. 
3. Database Container
Database pada aplikasi Antick Async menggunakan postgreSQL yang digunakan untuk menyimpan seluruh data aplikasi. 

---

## Ports

- Frontend → 3000  
- Backend → 8000  
- Database → 5433  

---

## Network

Semua container terhubung dalam satu Docker network bernama cloudapp, 
sehingga dapat saling berkomunikasi menggunakan nama service tanpa perlu menggunakan alamat IP.

---

## Volumes

Digunakan untuk menyimpan data database agar tidak hilang meskipun container dihentikan atau dihapus.

```
postgres-data:/var/lib/postgresql/data
```

---

## 🔑 Environment Variables

Aplikasi menggunakan environment variables untuk konfigurasi tanpa mengubah kode

```env
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@host.docker.internal:5432/cloudapp
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

Arsitektur 3 container pada aplikasi Antick Async dapat memungkinkan pemisahan yang jelas antra frontend, backend, dan database. Dengan menggunakan docker network, container dapat saling berkomunikasi dengan mudah serta memastikan data tetap aman dan tidak hilang.