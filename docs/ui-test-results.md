Berikut hasil dokumentasikan 10 test case

---

## 1. Cek status API 

API berhasil terhubung dengan status connected
![Foto hasil endpoint](images//week3/TestCase_1.png)

---
## 2. Verifikasi Data dari Modul 2
Data item dari modul 2 berhasil muncul pada daftar item 
![Foto hasil endpoint](images//week3/TestCase_2.png)

---
## 3. Menambahkan Item Baru 
Item beru berhasil ditambahkan 
![Foto hasil endpoint](images//week3/TestCase_3.png)

---
## 4.  Verifikasi Hasil Penambahan Item 
Item baru yang ditambahkan berhasil muncul pada daftar item 
![Foto hasil endpoint](images//week3/TestCase_4.png)

---
## 5. Fitur Edit Item 
Form edit otomatis terisi dengan data lama dari item 
![Foto hasil endpoint](images//week3/TestCase_5.png)

---
## 6. Update Data Lama 
Perubahan data berhasil 
![Foto hasil endpoint](images//week3/TestCase_6.png)

---
## 7. Mencari Item menggunakan Search Bar
Sistem berhasil menampilkan item yang sesuai dengan kata kunci pencarian 
![Foto hasil endpoint](images//week3/TestCase_7.png)

---
## 8. Menghapus Item 
Dialog konfirmasi penghapus muncul setelah tombol delete 
![Foto hasil endpoint](images//week3/TestCase_8.png)

---
## 9. Verifikasi penghapusan item 
Item berhasil dihapus dari daftar
![Foto hasil endpoint](images//week3/TestCase_9.png)

---
## 10. Empty State
Sistem menampilkan tampilan empty state
![Foto hasil endpoint](images//week3/TestCase_10.png)

---

## 11. Frontend Production Nginx Verification (Week 4)

Tujuan pengujian:
- Memastikan konfigurasi production Nginx pada frontend sudah aktif.
- Memastikan gzip compression berjalan.
- Memastikan security headers terkirim.
- Memastikan SPA fallback route benar.
- Memastikan static asset yang tidak ada tetap mengembalikan 404.

File konfigurasi yang diverifikasi:
- `frontend/nginx.conf`
- `frontend/public/50x.html`

### Command Verifikasi

```bash
docker rm -f nginx-check >/dev/null 2>&1 || true
docker build -f frontend/Dockerfile -t local-frontend-nginx-check:latest frontend
docker run --rm -d --name nginx-check -p 8088:80 local-frontend-nginx-check:latest

# Ambil nama file JS hasil build dari container
ASSET=$(docker exec nginx-check sh -c "ls /usr/share/nginx/html/assets/*.js | head -n 1 | xargs -n1 basename")

curl -sI http://localhost:8088/
curl -sI http://localhost:8088/random/spa/route
curl -sI -H 'Accept-Encoding: gzip' "http://localhost:8088/assets/$ASSET"
curl -sI http://localhost:8088/assets/not-found.js

docker stop nginx-check >/dev/null 2>&1 || true
```

### Ringkasan Hasil

1. Root route (`/`):
- Status `200 OK`
- Header security muncul: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`
- Header `Referrer-Policy` muncul
- Cache untuk app shell: `Cache-Control: no-cache`

2. SPA route acak (`/random/spa/route`):
- Status `200 OK`
- Fallback ke `index.html` berjalan sesuai desain SPA

3. Static asset build (`/assets/<hashed>.js`):
- Status `200 OK`
- Gzip aktif: `Content-Encoding: gzip`
- Caching jangka panjang aktif: `Cache-Control: max-age=31536000`

4. Static asset tidak ada (`/assets/not-found.js`):
- Status `404 Not Found`
- Tidak terjadi false 200 pada file asset yang hilang

### Kesimpulan Week 4

Konfigurasi Nginx frontend sudah siap untuk production baseline sesuai requirement:
1. Gzip compression: aktif.
2. Security headers wajib (`X-Frame-Options`, `X-Content-Type-Options`): aktif.
3. Custom error handling: tersedia untuk error server (`50x.html`).
4. SPA routing fallback: berjalan.
5. Missing static assets: tetap 404 (aman untuk observability dan debugging).
