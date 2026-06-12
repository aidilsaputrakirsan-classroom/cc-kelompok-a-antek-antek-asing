# Operations Guide – Antick Async
<br>

Dokumen ini merupakan panduan operasional untuk memantau kesehatan sistem, membaca log, melakukan request lintas layanan, memeriksa metrik, melakukan troubleshooting dasar, serta menentukan jalur  apabila terjadi insiden pada sistem Antick Async.

Antick Async menggunakan arsitektur microservices yang terdiri dari:

* Nginx API Gateway
* Auth Service
* Item Service
* Frontend (React SPA)
* PostgreSQL Auth Database
* PostgreSQL Item Database



## 1. Cara Mengecek Kesehatan Sistem (Health Check)

Health check digunakan untuk memastikan setiap layanan utama berjalan dengan baik.

### Health Check Lokal

| Service      | Endpoint                        |
| ------------ | ------------------------------- |
| Gateway      | `http://localhost/health`       |
| Auth Service | `http://localhost/auth/docs`  |
| Item Service | `http://localhost/items/docs` |

### Health Check Production

Jika VPS sedang aktif dan Cloudflare Tunnel berjalan,  dapat menggunakan endpoint berikut:

| Service          | Endpoint                                 |
| ---------------- | ---------------------------------------- |
| Gateway          | `https://api.antick-async.online/health` |
| Frontend         | `https://antick-async.online`            |
| Swagger API Docs | `https://api.antick-async.online/docs`   |

### Status

Nilai status yang mungkin muncul:

* `healthy` → seluruh komponen layanan berjalan normal.
* `degraded` → layanan masih berjalan tetapi terdapat komponen internal yang bermasalah.

Contoh respons Auth Service:

```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": "connected"
  }
}
```



## 2. Cara Membaca Log dan Melacak Request 

Antick Async menggunakan structured logging dengan format JSON sehingga lebih mudah diproses oleh log aggregator.

### Struktur Log

* `timestamp`
* `level`
* `service`
* `logger`
* `message`
* `taskName`

Contoh:

```json
{
  "timestamp": "2026-06-11T07:08:37.607022+00:00",
  "level": "INFO",
  "service": "auth-service",
  "logger": "uvicorn.access",
  "message": "127.0.0.1:55784 - \"GET /health HTTP/1.1\" 200",
  "taskName": "Task-9"
}
```


### Helper Script Logs

helper script:

```bash
scripts/logs.sh
```

Untuk melihat seluruh log secara real-time:

```bash
./scripts/logs.sh all
```

Script akan menjalankan:

```bash
docker compose logs -f auth-service item-service
```
<br>

---
### Melihat Error Log

Untuk menampilkan hanya log dengan level ERROR atau CRITICAL:

```bash
./scripts/logs.sh errors
```

Script akan melakukan filtering:

```bash
docker compose logs -f auth-service item-service \
| grep -E '"level":"ERROR"|"level":"CRITICAL"'
```
<br> 

### Request Tracing

Apabila ingin melacak request tertentu:

```bash
./scripts/logs.sh trace <keyword>
```

Contoh:

```bash
./scripts/logs.sh trace login
```

<br> 


## Cara Mengecek Metrics

###  Endpoint Metrics Lokal

| Service      | Endpoint                         |
| ------------ | -------------------------------- |
| Auth Service | `http://localhost/auth/metrics`  |
| Item Service | `http://localhost/items/metrics` |


### Endpoint Metrics Production


| Service      | Endpoint                                        |
| ------------ | ----------------------------------------------- |
| Auth Service | `https://api.antick-async.online/auth/metrics`  |
| Item Service | `https://api.antick-async.online/items/metrics` |

---

### Informasi Metrics

Setiap endpoint metrics mengembalikan informasi seperti:

```json
{
  "service": "auth-service",
  ...
}
```

atau

```json
{
  "service": "item-service",
  ...
}
```

---

## 3. Panduan Troubleshooting Umum

| Permasalahan                                           | Kemungkinan Penyebab                   | Solusi                                    |
| ----------------------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| Gateway tidak dapat diakses                           | Container gateway berhenti             | Jalankan `docker compose ps` lalu restart gateway |
| Frontend tidak muncul                                 | Container frontend mati                | Jalankan `docker compose restart frontend`        |
| Endpoint `/auth/health` menghasilkan status degraded  | Auth database tidak terhubung          | Periksa container `auth-db`                       |
| Endpoint `/items/health` menghasilkan status degraded | Item database tidak terhubung          | Periksa container `item-db`                       |
| Login gagal meskipun akun benar                       | Akun belum di-approve atau tidak aktif | Periksa status user pada dashboard admin          |
| Swagger Docs tidak dapat dibuka                       | Gateway atau backend mati              | Periksa status gateway dan auth-service           |
| Metrics tidak dapat diakses                           | Service backend sedang down            | Restart service terkait                           |
| Docker Compose gagal dijalankan                       | Docker Desktop belum aktif             | Jalankan Docker Desktop terlebih dahulu           |

---

## 4. Container

Melihat status container:

```bash
docker compose ps
```

Melihat log seluruh container:

```bash
docker compose logs
```

Restart seluruh layanan:

```bash
docker compose restart
```

Menghentikan seluruh layanan:

```bash
docker compose down
```

Menjalankan kembali layanan:

```bash
docker compose up --build -d
```

---

## 5. Catatan Deployment Production

Antick Async dideploy pada VPS lokal yang tidak selalu aktif

```bash
git pull origin main
docker compose up --build -d
```