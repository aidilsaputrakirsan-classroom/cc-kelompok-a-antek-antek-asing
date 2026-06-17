# REFLECTION PAPER: FRONTEND ENGINEERING PADA PROJEK CLOUD COMPUTING "ANTICK ASYNC"

**Oleh:** Muhammad Bagas Setiawan  
**NIM:** 10231061  
**Peran:** Frontend Developer  
**Mata Kuliah:** Cloud Computing (Kelompok A — Antek-Antek Asing)  
**Institusi:** Institut Teknologi Kalimantan  

---

## 1. Pendahuluan & Ringkasan Projek

**Antick Async** adalah aplikasi helpdesk dan ticketing internal berbasis cloud untuk membantu karyawan melaporkan masalah teknis (hardware, software, jaringan) ke tim IT Support. 

Sebagai **Frontend Developer**, tanggung jawab utama saya adalah membangun antarmuka pengguna (UI) yang responsif, interaktif, dan mudah digunakan. Saya menggunakan **Vite + React (JSX)** sebagai framework utama, **TailwindCSS** untuk styling, dan **Nginx** sebagai web server di lingkungan Docker. Saya juga bertugas menghubungkan UI dengan berbagai API backend (autentikasi, tiket, inventaris barang) serta menyusun visualisasi monitoring sistem di halaman status.

---

## 2. Garis Besar Perkembangan Frontend (Modul 1 - 15)

Pengembangan frontend berjalan secara bertahap seiring perkembangan arsitektur sistem:

*   **Fase 1: Tampilan Dasar & Fitur Utama (Modul 1 - 8)**  
    Fokus pada pembuatan halaman utama seperti Login, Register, Dashboard Ticket untuk Karyawan, Halaman IT Support, serta halaman admin untuk menyetujui pendaftaran pengguna baru.
*   **Fase 2: Setup Testing & CI Pipeline (Modul 6 - 8)**  
    Menerapkan pengujian unit (*unit testing*) menggunakan Vitest dan React Testing Library untuk memastikan komponen UI penting tidak rusak saat kode diubah.
*   **Fase 3: Kontainerisasi & Optimasi Build (Modul 9 - 11)**  
    Membungkus frontend ke dalam container Docker dan mengoptimalkannya dengan web server Nginx agar bisa dijalankan di server VPS melalui Docker Compose.
*   **Fase 4: Integrasi Mikroservis & Fitur Lanjutan (Modul 12 - 15)**  
    Menyesuaikan pemanggilan API setelah backend dipecah menjadi *Auth Service* dan *Item Service*. Menambahkan halaman **System Status** untuk memantau kesehatan (*health metrics*) dan performa masing-masing layanan secara real-time.

---

## 3. Struggle Terbesar & Perbaikan Terbanyak pada Frontend

Selama 15 modul pengerjaan projek ini, berikut adalah kesulitan-kesulitan terbesar yang saya hadapi dan bagaimana saya menyelesaikannya:

### A. Docker Build Error karena Out of Memory (OOM) di VPS
*   **Masalah/Struggle:**  
    Saat pertama kali mencoba build Docker frontend di VPS kecil, proses build seringkali berhenti tiba-tiba (*crash*) dengan pesan error memori habis (OOM). Hal ini disebabkan proses build bawaan Vite memakan banyak resource RAM yang melebihi batas VPS.
*   **Solusi & Perbaikan:**  
    Saya mengubah strategi Dockerfile menggunakan **Multi-stage Build**. Proses kompilasi kode React (`npm run build`) dilakukan di stage pertama, lalu hasil folder statis (`dist/`) langsung dipindahkan ke web server Nginx yang sangat ringan di stage kedua. Hal ini secara drastis mengurangi penggunaan memori VPS saat deployment.

### B. Masalah CORS dan Routing API Setelah Pemisahan Mikroservis
*   **Masalah/Struggle:**  
    Ketika backend didekomposisi menjadi mikroservis di Modul 12, frontend sempat mengalami error CORS (Cross-Origin Resource Sharing) karena mencoba menembak port port server yang berbeda (Auth di `8001` dan Item di `8002`) secara langsung.
*   **Solusi & Perbaikan:**  
    Saya mengubah konfigurasi pemanggilan API di frontend. Alih-alih menembak masing-masing port mikroservis secara langsung, frontend diarahkan untuk menembak satu gerbang utama yaitu **Nginx API Gateway** di port default `http://localhost` (atau domain produksi). API Gateway yang kemudian bertugas meneruskan request tersebut secara internal ke servis yang tepat.

### C. Kegagalan Unit Testing di Pipeline CI (GitHub Actions)
*   **Masalah/Struggle:**  
    Dalam beberapa commit awal, alur integrasi otomatis (CI/CD) di GitHub selalu gagal (*failed*) pada bagian pengujian frontend. Isunya adalah ketidakcocokan versi *package* di file `package-lock.json` serta hilangnya konfigurasi library pengujian di lingkungan testing server CI.
*   **Solusi & Perbaikan:**  
    Saya membersihkan ulang dependensi testing di `package.json`, mengunci versi yang stabil, memperbarui file `package-lock.json`, serta menyesuaikan script pengujian di GitHub Actions menggunakan `npm ci` agar instalasi dependensi di server CI selalu bersih dan konsisten dengan komputer lokal.

### D. Optimasi Visual Animasi Lottie pada Halaman Status Sistem
*   **Masalah/Struggle:**  
    Halaman *System Status* menggunakan animasi Lottie untuk menggambarkan kondisi Gateway (kucing senang jika sehat, kucing menangis jika down). Di awal implementasi, pemuatan file JSON animasi Lottie lambat dan posisinya menimpa teks informasi di bawahnya. Selain itu ukurannya terlalu kecil untuk dilihat.
*   **Solusi & Perbaikan:**  
    Saya memperbaiki logic pemuatan file JSON secara dinamis melalui React `fetch` agar tidak membebani performa awal halaman. Saya juga menata ulang CSS Tailwind dan memperbesar ukuran box animasi agar responsif dan tidak menumpuk dengan komponen status lainnya.

### E. Optimasi Visual Spline 3D pada Login Page:**  
    Halaman Login menggunakan animasi Spline 3D untuk menampilkan animasi "robot" di sebelah kanan form login. Di awal implementasi, pemuatan file JSON animasi Lottie lambat dan posisinya menimpa teks informasi di bawahnya. Selain itu ukurannya terlalu kecil untuk dilihat.
*   **Solusi & Perbaikan:**  
    Saya menggunakan komponen `<spline-viewer-react>` yang sudah disediakan dan mengatur properti CSS-nya agar ukuran animasi optimal pada berbagai perangkat.