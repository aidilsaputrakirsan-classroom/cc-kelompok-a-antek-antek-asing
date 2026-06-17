# REFLECTION PAPER: BACKEND ENGINEERING PADA PROJEK CLOUD COMPUTING "ANTICK ASYNC"

**Oleh:** Muhammad Athala Romero  
**NIM:** 10231059  
**Peran:** Lead Backend Developer  
**Mata Kuliah:** Cloud Computing (Kelompok A — Antek-Antek Asing)  
**Institusi:** Institut Teknologi Kalimantan  

---

## 1. Pendahuluan & Ringkasan Projek

**Antick Async** adalah sistem helpdesk dan ticketing internal berbasis cloud yang dirancang untuk membantu karyawan (*employee*) dalam mengajukan tiket permasalahan teknis (seperti masalah perangkat keras, perangkat lunak, dan jaringan). Tiket tersebut kemudian dikelola oleh tim IT Support (*it_employee*) dan diawasi oleh Admin/Superadmin melalui dashboard analitik.

Sebagai **Lead Backend Developer**, tanggung jawab utama saya adalah merancang arsitektur server, memastikan ketersediaan dan performa API, mendesain skema database yang aman dan efisien, serta mengoordinasikan migrasi dari arsitektur monolitik ke arsitektur mikroservis (*microservices*). Projek ini dikerjakan secara intensif mulai dari Modul 1 hingga Modul 15, mencakup pengembangan fitur dasar, kontainerisasi, CI/CD, pemisahan servis, hingga pengetatan keamanan (*security hardening*).

---

## 2. Garis Besar Perkembangan Backend (Modul 1 - 15)

Secara garis besar, perjalanan pengembangan backend yang saya pimpin dibagi menjadi beberapa fase penting:

*   **Fase 1: Monolith & Core API (Modul 1 - 11)**  
    Mengembangkan sistem dasar menggunakan **FastAPI** dan PostgreSQL. Pada fase ini, saya membuat fitur autentikasi dan otorisasi menggunakan JWT (berbasis token dengan algoritma HS256), merancang alur pendaftaran pengguna dengan status *Pending* hingga mendapatkan persetujuan admin (*User Approval Workflow*), CRUD Tiket lengkap dengan melacak riwayat perubahan, sistem notifikasi (termasuk modul notifikasi email via SMTP), dan dashboard metrik awal.
*   **Fase 2: Pemisahan Mikroservis & Komunikasi Antar-Layanan (Modul 12)**  
    Mendekomposisi struktur monolit menjadi dua layanan mikro terpisah:
    1.  **Auth Service** (port `8001`): Melayani registrasi, login, manajemen user (dan role), departemen, kategori, tiket, serta notifikasi.
    2.  **Item Service** (port `8002`): CRUD inventaris barang yang digunakan oleh staf IT.
    
    Kedua layanan ini berkomunikasi secara internal. `item-service` memvalidasi token JWT pengguna dengan memanggil endpoint `GET /verify` di `auth-service` via HTTP client internal (`auth_client.py`).
*   **Fase 3: Observabilitas & Tracing (Modul 13 - 14)**  
    Menambahkan middleware logging JSON terstruktur di kedua layanan, memancarkan metrik internal berbasis memori, dan menerapkan **Correlation ID** agar setiap *request* yang masuk dari Nginx API Gateway dapat dilacak perjalanannya lintas layanan.
*   **Fase 4: Security Hardening & Pemolesan Akhir (Modul 15)**  
    Melakukan audit keamanan menyeluruh, memindahkan sisa kredensial di kode ke variabel lingkungan (`.env`), mengetatkan aturan validasi regex untuk kekuatan password, membatasi ukuran muatan (*payload*) masukan, dan menerapkan batas laju permintaan (*rate limiting*) di level Nginx API Gateway.

---

## 3. *Struggle* Terbesar & Perbaikan Terbanyak pada Backend

Selama pengerjaan projek dari Modul 1 hingga 15, ada beberapa *struggle* teknis yang paling sering saya perbaiki dan selesaikan demi menjaga stabilitas backend "Antick Async":

### A. Regresi dan Kompleksitas Pemisahan Monolit ke Mikroservis (Modul 12)
*   **Masalah/Struggle:**  
    Saat memisahkan monolit menjadi mikroservis di Modul 12, awalnya diputuskan untuk membuat `auth-service` murni hanya mengurus autentikasi dan profil pengguna. Namun, langkah ini memicu regresi hebat di repositori. Seluruh endpoint monolitik yang sudah stabil sebelumnya (seperti tiket, departemen, kategori, notifikasi, persetujuan admin, dan dashboard) tiba-tiba tidak terakomodasi dan rusak. Hal ini mengakibatkan CI test gagal dan build Docker terhenti.
*   **Solusi & Perbaikan (Commit `472a7a8` & `46c87da`):**  
    Saya harus turun tangan untuk **merestorasi semua dependensi monolitik, skema, dan model** yang sempat hilang, serta menyatukan kembali rute-rute tiket, notifikasi, dan analitik ke dalam kontainer `auth-service` (sehingga kini berfungsi sebagai *Auth & Core Entities Service*). Saya juga menyelaraskan konfigurasi port internal (Auth di `8001` dan Item di `8002`) serta memperbarui skema Pydantic (`VerifyResponse`) agar komunikasi inter-servis berjalan tanpa kesalahan otorisasi.

### B. Sinkronisasi Modul Utilitas Bersama (*Shared Library*)
*   **Masalah/Struggle:**  
    Untuk menjaga arsitektur *self-contained* pada Docker images, modul utilitas observabilitas (seperti generator terstruktur log JSON, middleware penangkap Correlation ID, dan metrik in-memory) diletakkan di `services/shared/`. Modul ini kemudian diduplikasi secara manual ke `services/auth-service/shared/` dan `services/item-service/shared/`.  
    Setiap kali saya memperbaiki bug format log atau menambahkan penanganan pengecualian (*exception handling*) baru di salah satu servis, file-file di folder `shared` ini tidak sinkron. Hal ini memicu ketidakkonsistenan output log, kegagalan pembacaan log pada utilitas CLI, bahkan galat sintaksis Python saat dijalankan di dalam container.
*   **Solusi & Perbaikan (Commit `9f93414`, `86194c3`, `ef640f2`):**  
    Saya melakukan standarisasi penuh pada format log terstruktur JSON dan mematangkan middleware log request agar Correlation ID (`X-Correlation-ID`) selalu di-parse dari header HTTP incoming dan diteruskan kembali secara konsisten. Saya menerapkan disiplin sinkronisasi manual tiga arah setiap kali ada modifikasi log, serta menyederhanakan kode logging agar meminimalisasi dependensi eksternal yang rentan memecah build Docker.

### C. Kompatibilitas Skema PostgreSQL dan *Startup Migrations*
*   **Masalah/Struggle:**  
    Ketika tim DevOps melakukan deploy ke VPS menggunakan Docker Compose, kami sering mengalami isu database crash. Masalahnya adalah ketika model SQLAlchemy backend diperbarui (misalnya, menambahkan kolom baru pada tabel `users` seperti `department_id`, `approved_by`, atau `avatar_index`), database PostgreSQL yang menggunakan persistent volume Docker lama tidak mengenali kolom tersebut. Hal ini memicu galat `UndefinedColumn` saat aplikasi memproses registrasi atau login pengguna baru.
*   **Solusi & Perbaikan (Commit `5bad724` & `database.py`):**  
    Untuk menghindari keharusan menghapus volume database di produksi (yang akan melenyapkan data riil), saya merancang fungsi startup migration otomatis (`run_startup_migrations`) di `database.py`. Fungsi ini dijalankan tepat saat event lifespan FastAPI dimulai. Ia mengeksekusi perintah mentah SQL:
    ```sql
    ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status userstatus NOT NULL DEFAULT 'active';
    -- dan kolom opsional lainnya...
    ```
    Perbaikan ini memastikan skema database di VPS selalu kompatibel dengan kode backend terbaru tanpa risiko kehilangan data (*data loss*).

### D. Pengetatan Validasi Pydantic & *Prevention of Integer Overflow* (Modul 15)
*   **Masalah/Struggle:**  
    Dalam audit keamanan pada Modul 15, ditemukan bahwa backend kami rentan terhadap masukan berbahaya. Tidak adanya pembatasan nilai kuantitas inventaris dapat memicu *Integer Overflow* di database PostgreSQL. Selain itu, input nama atau deskripsi tiket yang terlalu besar dapat mengeksploitasi memori server (*Denial of Service* via payload besar).
*   **Solusi & Perbaikan (Commit `c4b5e29` & `services/item-service/schemas.py`):**  
    Saya menerapkan pengamanan di tingkat Pydantic schemas. Pada `item-service/schemas.py`, field `quantity` dibatasi secara ketat menggunakan dekorator bawaan Pydantic (`ge=0, le=10000`). Saya juga membatasi panjang teks parameter `name` maksimal 300 karakter, dan `description` maksimal 2000 karakter. Pada `auth-service/schemas.py`, saya menambahkan validator regex yang kuat untuk password pendaftaran pengguna baru (wajib minimal 8 karakter, maksimal 128, harus mengandung minimal 1 huruf besar dan 1 angka) guna memperkuat kredensial dari serangan *brute force*.

---

## 4. Analisis Kode Solusi Backend Terpilih

Berikut adalah contoh implementasi pengamanan skema masukan dan kekuatan password yang saya terapkan pada `services/auth-service/schemas.py` untuk mengatasi masalah celah validasi:

```python
# Validator kekuatan password pada registrasi user baru
class UserCreate(BaseModel):
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=200, examples=["Aidil Saputra"])
    password: str = Field(..., min_length=8, max_length=128, examples=["Password123!"])

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value):
        # Regex memastikan min 1 huruf kecil, 1 huruf besar, 1 angka, dan panjang 8-128 karakter
        password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#_]{8,128}$"
        if not re.match(password_regex, value):
            raise ValueError("Password harus mengandung minimal 1 huruf besar, 1 angka, dan maksimal 128 karakter.")
        return value
```

Di tingkat komunikasi inter-servis (`services/item-service/auth_client.py`), saya merancang penanganan kegagalan untuk mengantisipasi jika `auth-service` mengalami *down* atau *timeout*:

```python
async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)) -> dict:
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.AUTH_SERVICE_URL}/verify",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Correlation-ID": correlation_id
                },
                timeout=5.0, # Mencegah request menggantung selamanya
            )
    except httpx.ConnectError:
        logger.error("Auth Service tidak terjangkau", extra={"correlation_id": correlation_id})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth Service tidak dapat dihubungi. Silakan coba lagi nanti.",
        )
    except httpx.TimeoutException:
        logger.error("Auth Service mengalami timeout", extra={"correlation_id": correlation_id})
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Auth Service timeout. Silakan coba lagi nanti.",
        )
    # ... validasi status respon HTTP 200 ...
```

---

## 5. Kesimpulan & Pembelajaran Terbesar

Melalui projek Cloud Computing ini, khususnya dalam mengawal backend **Antick Async** hingga Modul 15, saya memperoleh banyak wawasan berharga:

1.  **Pemisahan Mikroservis Memerlukan Perencanaan yang Matang:** Pemecahan layanan dari monolit tidak boleh merusak fungsionalitas sistem yang sudah berjalan (*backward compatibility*). Koordinasi routing API Gateway (Nginx) sangat krusial agar alur data frontend tidak terputus.
2.  **Keamanan di Tingkat Aplikasi Adalah Fondasi Utama:** Menerapkan variabel lingkungan untuk rahasia sensitif (*secrets*), validasi tipe data yang ketat di level skema (mencegah overflow), serta enkripsi password yang kokoh bukan sekadar formalitas tugas, melainkan benteng pertama pertahanan sistem di dunia nyata.
3.  **Observabilitas Menyelamatkan Waktu Debugging:** Ketika sistem berjalan dalam kontainer terisolasi di VPS, membaca log mentah sangatlah sulit. Dengan *structured JSON logging* dan integrasi *Correlation ID*, waktu melacak bug inter-service berkurang secara signifikan karena kita dapat memetakan perjalanan alur request dengan presisi.
