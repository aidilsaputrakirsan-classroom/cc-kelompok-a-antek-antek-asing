# 🐳 Docker Architecture

## 📖 Deskripsi
Aplikasi menggunakan arsitektur 3 container yang terdiri dari frontend, backend, dan database.  
Semua container terhubung dalam satu Docker network sehingga dapat saling berkomunikasi.

---

## 📊 Diagram Arsitektur

```mermaid
graph TD

User[Browser (Host Machine)]

Frontend[Frontend Container\nPort: 5173]
Backend[Backend Container\nPort: 8000]
Database[(PostgreSQL\nPort: 5432)]

Volume[(Volume\npostgres-data)]

User -->|Access UI| Frontend
Frontend -->|API Request| Backend
Backend -->|Query DB| Database
Database -->|Store Data| Volume

subgraph Docker Network (app-network)
Frontend
Backend
Database
end
```

---

## 🔌 Ports

- Frontend → 5173  
- Backend → 8000  
- Database → 5432  

---

## 🌐 Network

Semua container menggunakan network yang sama:

```
app-network
```

---

## 💾 Volumes

Digunakan untuk menyimpan data database agar tidak hilang:

```
postgres-data:/var/lib/postgresql/data
```

---

## 🔑 Environment Variables

Contoh konfigurasi:

```env
DATABASE_URL=postgresql://user:password@db:5432/app
```

---

## 🎯 Kesimpulan

Arsitektur ini memungkinkan komunikasi antar service secara efisien dalam satu lingkungan Docker.  
Penggunaan volume memastikan data tetap tersimpan meskipun container dihentikan.