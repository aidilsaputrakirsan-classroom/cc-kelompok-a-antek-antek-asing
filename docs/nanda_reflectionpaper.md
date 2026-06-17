# REFLECTION PAPER: QA & DOCUMENTATION  PADA PROJEK CLOUD COMPUTING "ANTICK ASYNC"

Nama: Nanda Aulia Putri
NIM: NIM 10231067
Peran: QA & Documentation
Mata Kuliah: Cloud Computing

---

# 1. Pendahuluan & Ringkasan Projek

Antick Async merupakan sistem helpdesk dan ticketing internal berbasis cloud yang digunakan untuk membantu proses pelaporan serta pengelolaan permasalahan teknis dalam lingkungan organisasi. Sistem ini memungkinkan employee membuat tiket permasalahan, kemudian tiket tersebut dikelola oleh tim IT Support dan dipantau oleh admin melalui dashboard.

Dalam projek ini, saya berperan sebagai QA & Documentation Engineer yang bertanggung jawab dalam memastikan kualitas sistem melalui proses testing, validasi fitur, identifikasi bug, serta memastikan dokumentasi projek selalu sesuai dengan perkembangan implementasi sistem.

Peran QA tidak hanya melakukan pengecekan apakah sistem berjalan, tetapi juga memastikan perubahan yang dilakukan developer tidak menyebabkan regresi terhadap fitur sebelumnya. Selain itu, dokumentasi menjadi bagian penting untuk menjaga pemahaman tim terhadap arsitektur, deployment, testing, dan penggunaan sistem.

---

# 2. Perkembangan QA & Documentation (Modul 1 - 15)

Secara keseluruhan, proses QA dan dokumentasi berkembang mengikuti perubahan arsitektur sistem:

## Fase 1: Functional Testing & Validasi Sistem Dasar (Modul 1 - 8)

Pada tahap awal pengembangan, fokus QA adalah memastikan fitur utama sistem berjalan sesuai requirement.

Pengujian dilakukan terhadap:

* Authentication (register dan login)
* JWT authentication
* CRUD ticket/item
* Role-based access control
* Integrasi frontend dan backend

Pada fase ini ditemukan beberapa kebutuhan perbaikan seperti validasi input, handling error, serta memastikan setiap endpoint memberikan response yang sesuai.

---

## Fase 2: Containerization & Deployment Validation (Modul 9 - 11)

Ketika sistem mulai menggunakan Docker dan CI/CD, fokus QA berkembang ke arah validasi environment.

Pengujian yang dilakukan mencakup:

* Apakah container dapat berjalan dengan benar
* Apakah service dapat berkomunikasi
* Apakah aplikasi dapat dijalankan melalui Docker Compose
* Apakah perubahan kode melewati proses CI

Pada tahap ini dipahami bahwa CI bukan menjamin sistem bebas bug, tetapi memastikan perubahan kode berhasil melewati test yang telah dibuat sebelum masuk branch utama.

---

## Fase 3: Microservices Testing & Reliability Documentation (Modul 12 - 14)

Saat sistem berpindah dari monolith menjadi microservices, QA perlu memastikan komunikasi antar service tetap berjalan.

Pengujian difokuskan pada:

* Auth-service dan item-service communication
* API contract antar service
* Health check endpoint
* Error handling ketika service mengalami gangguan
* Dokumentasi reliability testing

Salah satu temuan penting adalah bahwa health check hanya menunjukkan service masih aktif, tetapi belum menjamin seluruh fitur berjalan normal.

Contohnya:

```
GET /health → 200 OK
```

tetapi:

```
GET /items → error
```

Hal tersebut dapat terjadi karena masalah database, komunikasi antar service, konfigurasi environment, atau autentikasi.

---

## Fase 4: Security & Final Documentation (Modul 15)

Pada tahap akhir, fokus QA dan dokumentasi diarahkan pada kesiapan sistem sebelum final release.

Aktivitas yang dilakukan:

* Review dokumentasi API Contract
* Validasi testing documentation
* Review deployment guide
* Pemeriksaan CHANGELOG
* Dokumentasi hasil testing
* Menyusun reflection dan laporan akhir

---

# 3. Struggle Terbesar & Perbaikan QA Documentation

## A. Perbedaan Kondisi Dokumentasi dengan Implementasi Sistem

### Masalah/Struggle:

Salah satu tantangan terbesar adalah menjaga agar dokumentasi tetap sesuai dengan kondisi terbaru sistem.

Ketika sistem berkembang dari monolith menjadi microservices, beberapa bagian dokumentasi awal sudah tidak sesuai, seperti struktur service, endpoint, dan alur komunikasi antar komponen.

Hal ini dapat menyebabkan kebingungan ketika anggota tim baru memahami sistem.

### Solusi & Perbaikan:

Melakukan pembaruan dokumentasi secara bertahap:

* Memperbarui architecture documentation
* Menyesuaikan API contract dengan endpoint terbaru
* Menambahkan deployment guide
* Memperbarui README berdasarkan struktur projek terbaru

Dengan dokumentasi yang diperbarui, anggota tim dapat memahami perubahan sistem tanpa harus membaca seluruh kode.

---

# B. Validasi CI Testing dan Keterbatasan Test Case

### Masalah/Struggle:

Ditemukan bahwa CI dapat berhasil walaupun masih terdapat kemungkinan bug pada sistem.

Hal ini terjadi karena CI hanya menjalankan test case yang telah dibuat.

Contoh:

CI melakukan:

* test login
* test health endpoint
* test CRUD item

Namun belum memiliki test:

* validasi akses role tertentu
* kondisi error antar service

Sehingga sistem dapat tetap mendapatkan status berhasil walaupun terdapat bug yang belum diuji.

### Solusi & Perbaikan:

Sebagai QA, dilakukan evaluasi terhadap skenario testing dengan menambahkan sudut pandang pengguna.

Testing tidak hanya memastikan fitur berjalan, tetapi juga memastikan:

* validasi akses sesuai role
* error handling berjalan
* perubahan baru tidak merusak fitur lama

---

# C. Reliability Testing pada Microservices

### Masalah/Struggle:

Pada implementasi awal, sistem belum memiliki retry mechanism dan circuit breaker.

Ketika salah satu service mengalami gangguan, komunikasi antar service dapat gagal.

Contoh:

item-service membutuhkan verifikasi token dari auth-service.

Jika auth-service mengalami downtime:

```
item-service
      |
      X
auth-service
```

maka request tidak dapat diproses.

### Solusi & Perbaikan:

Dokumentasi reliability dibuat untuk mencatat kondisi sistem saat ini:

* Service availability
* Health check
* Auth service dependency
* Recovery scenario

Walaupun circuit breaker belum diterapkan, konsep resilience tetap didokumentasikan sebagai pengembangan lanjutan.

---

# D. Dokumentasi Testing dan API Contract

### Masalah/Struggle:

Dalam pengembangan sistem besar, setiap service memiliki endpoint yang berbeda sehingga diperlukan dokumentasi komunikasi yang jelas.

Tanpa API contract, frontend dan backend dapat mengalami ketidaksesuaian.

### Solusi & Perbaikan:

Membuat dokumentasi:

* Endpoint
* HTTP method
* Request format
* Response format
* Authentication requirement
* Status code

Dokumentasi ini membantu developer, tester, dan anggota tim lain memahami aturan komunikasi sistem.

---

# 4. Implementasi QA yang Dilakukan

Sebagai QA & Documentation Engineer, beberapa proses validasi yang dilakukan:

## Functional Testing

Melakukan pengecekan:

* Register berhasil
* Login menghasilkan JWT
* CRUD berjalan
* Role memiliki batas akses
* Data tersimpan sesuai database

---

## Regression Testing

Setiap perubahan besar dilakukan pengecekan ulang terhadap fitur lama.

Contoh:

Setelah penambahan fitur baru:

* Login masih berjalan
* Dashboard masih tampil
* CRUD lama tidak rusak

---

## Documentation Testing

Memastikan:

* README sesuai kondisi terbaru
* Dokumentasi deployment dapat digunakan
* API contract sesuai implementasi
* Testing report tersedia

---

# 5. Kesimpulan & Pembelajaran Terbesar

Melalui projek Cloud Computing Antick Async, saya memahami bahwa QA tidak hanya berperan sebagai pihak yang mencari kesalahan, tetapi sebagai bagian yang menjaga kualitas sistem secara keseluruhan.

Beberapa pembelajaran utama:

1. Testing tidak dapat menjamin sistem bebas bug, tetapi membantu mengurangi risiko melalui skenario yang terencana.

2. CI/CD membantu menjaga kualitas perubahan kode dengan melakukan validasi otomatis sebelum deployment.

3. Dokumentasi merupakan bagian penting dalam sistem cloud karena banyak komponen yang saling berhubungan seperti service, database, container, dan deployment.

4. QA memiliki peran penting dalam Pull Request untuk memastikan perubahan sudah memenuhi requirement dan tidak merusak sistem sebelumnya.

Melalui proses QA dan dokumentasi, sistem Antick Async menjadi lebih siap untuk dikembangkan, diuji, dan dipelihara pada tahap berikutnya.
