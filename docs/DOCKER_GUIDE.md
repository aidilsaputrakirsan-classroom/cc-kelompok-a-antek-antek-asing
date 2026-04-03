# DOCKER GUIDE

Panduan lengkap untuk bekerja dengan Docker pada proyek tim Antek Antek Asing.

## Perintah - Perintah Dasar

1. **Membangun (Build) Docker Image**
   Digunakan untuk membuat image kita setelah ada perubahan aplikasi:
   ```bash
   # Build Backend Image
   docker build -t notyourkisee/cloudapp-backend:v1 ./backend
   
   # Build Frontend Image (dijalankan dari root folder proyek)
   docker build -t notyourkisee/cloudapp-frontend:v1 ./frontend
   ```

2. **Menjalankan (Run) Kontainer Docker**
   Setelah image dibuat, jalankan aplikasi ke dalam kontainer (proses berjalan di memori PC kita):
   ```bash
   # Run Frontend Test Container in Background (-d)
   docker run -d --name frontend-test -p 3000:80 notyourkisee/cloudapp-frontend:v1
   ```

3. **Mendorong (Push) Docker Image**
   Agar image aplikasi yang sudah dibuat bisa digunakan oleh rekan tim lain atau di-deploy ke server, masukkan ("publish" atau "upload") ke registry Docker Hub:
   ```bash
   docker push notyourkisee/cloudapp-backend:v1
   ```

4. **Menarik (Pull) Docker Image**
   Jika kita memakai PC lain, atau rekan tim baru bergabung, maka tinggal unduh dengan pull:
   ```bash
   docker pull notyourkisee/cloudapp-backend:v1
   ```

5. **Otomatisasi lewat Script**
   Jalankan helper script untuk build, run, push, dan clean:
   ```bash
   ./scripts/docker.sh build
   ./scripts/docker.sh run
   ./scripts/docker.sh push
   ./scripts/docker.sh clean
   ```

## Checklist Tugas Docker Tim
- [x] Backend Dockerfile siap dengan Healthcheck.
- [x] Frontend Dockerfile siap (Multistage-build menggunakan Node dan Nginx).
- [x] Evaluasi efisiensi ukuran telah dilakukan antara tipe image standar dan slim.
- [x] Security Audit kontainer Nginx berhasil diverifikasi.