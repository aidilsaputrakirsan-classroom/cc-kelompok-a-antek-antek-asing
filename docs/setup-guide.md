# 📘 Setup Guide - Cloud App (Antick Async)

> **Panduan Lengkap Setup dan Instalasi Backend & Frontend**  
> Sistem Internal Helpdesk Cloud - Komputasi Awan SI ITK

---

## 📑 Daftar Isi

1. [Tentang Proyek](#tentang-proyek)
2. [Prasyarat Sistem](#prasyarat-sistem)
3. [Tech Stack](#tech-stack)
4. [Struktur Proyek](#struktur-proyek)
5. [Setup Backend](#setup-backend)
6. [Setup Frontend](#setup-frontend)
7. [Menjalankan Aplikasi](#menjalankan-aplikasi)
8. [Konfigurasi Database](#konfigurasi-database)
9. [API Documentation](#api-documentation)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)
13. [Tim Pengembang](#tim-pengembang)

---

## 🎯 Tentang Proyek

**Antick Async** adalah sistem internal helpdesk berbasis cloud yang dirancang untuk membantu perusahaan mengelola alur pekerjaan internal secara terstruktur dan terdokumentasi. Sistem ini memungkinkan karyawan untuk:

- Membuat dan menyelesaikan tiket pekerjaan (maintenance, perbaikan perangkat, teknis)
- Mencatat dan memantau aktivitas kerja secara sistematis
- Mengevaluasi performa karyawan berbasis data
- Meningkatkan transparansi operasional perusahaan

### Fitur Utama

- ✅ CRUD operations untuk manajemen items/tiket
- 🔍 Search dan filtering items
- 📊 Sorting berdasarkan nama, harga, dan tanggal
- 📈 Statistik inventory (total items, nilai, harga tertinggi/terendah)
- 🎨 UI/UX responsif dengan React
- 🔄 Real-time connection status monitoring
- 📱 Toast notifications untuk user feedback
- 🔐 CORS-enabled API untuk integrasi frontend-backend

---

## 💻 Prasyarat Sistem

Pastikan sistem Anda sudah memiliki tools berikut sebelum memulai:

### Required

| Tool | Versi Minimum | Cara Cek Versi | Download Link |
|------|--------------|----------------|---------------|
| **Python** | 3.10+ | `python --version` | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18.0+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | `npm --version` | (included with Node.js) |
| **PostgreSQL** | 13+ | `psql --version` | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com/) |

### Optional (Recommended)

- **pip** (Python package installer) - biasanya sudah include dengan Python
- **venv** atau **virtualenv** untuk Python virtual environment
- **PostgreSQL GUI** seperti pgAdmin, DBeaver, atau TablePlus
- **API Testing Tool** seperti Postman, Insomnia, atau Thunder Client (VS Code)
- **Code Editor**: VS Code, PyCharm, atau editor favorit Anda

### Catatan Penting

> ⚠️ **Windows Users**: Jika menggunakan Laragon, pastikan PostgreSQL service sudah berjalan di Laragon panel sebelum menjalankan backend.

> 🐧 **Linux/Mac Users**: Install PostgreSQL menggunakan package manager sistem Anda (apt, brew, dll).

---

## 🛠️ Tech Stack

### Backend (API Server)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **FastAPI** | 0.115.0 | Web framework untuk REST API |
| **Uvicorn** | 0.30.0 | ASGI server untuk menjalankan FastAPI |
| **SQLAlchemy** | 2.0.35 | ORM untuk database operations |
| **Pydantic** | 2.9.0 | Data validation dan serialization |
| **psycopg2-binary** | 2.9.9 | PostgreSQL database adapter |
| **python-dotenv** | 1.0.1 | Environment variables management |

### Frontend (User Interface)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | 19.2.0 | UI library |
| **Vite** | 7.3.1 | Build tool dan dev server |
| **React DOM** | 19.2.0 | React renderer |
| **ESLint** | 9.39.1 | Code linting |

### Database

- **PostgreSQL** 13+ - Relational database untuk menyimpan data items/tiket

### Architecture Pattern

```
┌─────────────────┐
│  React Frontend │  (Port 5173)
│   (Vite SPA)    │
└────────┬────────┘
         │ HTTP REST API
         ▼
┌─────────────────┐
│ FastAPI Backend │  (Port 8000)
│   + Uvicorn     │
└────────┬────────┘
         │ SQLAlchemy ORM
         ▼
┌─────────────────┐
│   PostgreSQL    │  (Port 5432)
│    Database     │
└─────────────────┘
```

---

## 📁 Struktur Proyek

```
cc-kelompok-a-antek-antek-asing/
│
├── README.md                          # Dokumentasi utama proyek
├── .gitignore                         # File yang diabaikan Git
│
├── backend/                           # Backend API (Python/FastAPI)
│   ├── __pycache__/                   # Python bytecode cache
│   ├── .env                           # Environment variables (tidak di-commit)
│   ├── .env.example                   # Template environment variables
│   ├── main.py                        # Entry point aplikasi FastAPI
│   ├── database.py                    # Database connection & session
│   ├── models.py                      # SQLAlchemy database models
│   ├── schemas.py                     # Pydantic schemas (validation)
│   ├── crud.py                        # CRUD operations logic
│   └── requirements.txt               # Python dependencies
│
├── frontend/                          # Frontend UI (React/Vite)
│   ├── node_modules/                  # NPM dependencies (auto-generated)
│   ├── public/                        # Static assets
│   │   └── image/                     # Images
│   ├── src/                           # Source code
│   │   ├── components/                # React components
│   │   │   ├── Header.jsx             # Header dengan stats
│   │   │   ├── ItemCard.jsx           # Card untuk display item
│   │   │   ├── ItemForm.jsx           # Form create/edit item
│   │   │   ├── ItemList.jsx           # List container
│   │   │   ├── SearchBar.jsx          # Search functionality
│   │   │   ├── SortBar.jsx            # Sort dropdown
│   │   │   └── Toast.jsx              # Notification toast
│   │   ├── services/                  # API services
│   │   │   └── api.js                 # API calls ke backend
│   │   ├── assets/                    # Assets (images, icons)
│   │   ├── App.jsx                    # Main App component
│   │   ├── App.css                    # App-specific styles
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles
│   ├── .env                           # Environment variables (tidak di-commit)
│   ├── .env.example                   # Template environment variables
│   ├── index.html                     # HTML template
│   ├── package.json                   # NPM dependencies & scripts
│   ├── package-lock.json              # NPM lock file
│   ├── vite.config.js                 # Vite configuration
│   ├── eslint.config.js               # ESLint configuration
│   └── README.md                      # Frontend documentation
│
└── docs/                              # Dokumentasi proyek
    ├── setup-guide.md                 # Panduan setup (file ini)
    ├── api-test-results.md            # Hasil testing API
    ├── ui-test-results.md             # Hasil testing UI
    ├── test.md                        # Test documentation
    ├── member-*.md                    # Dokumentasi per anggota tim
    └── images/                        # Screenshots & diagrams
        ├── week1/
        ├── week2/
        └── week3/
```

---

## 🔧 Setup Backend

### Step 1: Clone Repository

```bash
# Clone repository
git clone <repository-url>
cd cc-kelompok-a-antek-antek-asing
```

### Step 2: Masuk ke Folder Backend

```bash
cd backend
```

### Step 3: Buat Virtual Environment (Recommended)

Virtual environment memastikan dependencies tidak konflik dengan sistem Python Anda.

#### Windows (PowerShell/CMD):

```powershell
# Buat virtual environment
python -m venv .venv

# Aktifkan virtual environment
.venv\Scripts\activate

# Jika menggunakan PowerShell dan error, jalankan:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### macOS/Linux:

```bash
# Buat virtual environment
python3 -m venv .venv

# Aktifkan virtual environment
source .venv/bin/activate
```

**Ciri-ciri virtual environment aktif**: Ada prefix `(.venv)` di command prompt Anda.

### Step 4: Install Dependencies

```bash
# Install semua package yang dibutuhkan
pip install -r requirements.txt

# Verifikasi instalasi
pip list
```

**Yang terinstall**:
- fastapi==0.115.0
- uvicorn==0.30.0
- sqlalchemy==2.0.35
- psycopg2-binary==2.9.9
- python-dotenv==1.0.1
- pydantic[email]==2.9.0

### Step 5: Konfigurasi Environment Variables

```bash
# Copy file template
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux
```

Edit file `.env` dengan text editor:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cloudapp

# JWT Configuration (untuk future authentication)
SECRET_KEY=ganti-dengan-random-string-panjang-minimal-32-karakter
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Penting**: Ganti `YOUR_PASSWORD` dengan password PostgreSQL Anda!

### Step 6: Setup Database PostgreSQL

#### 1. Buat Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database baru
CREATE DATABASE cloudapp;

# Cek database sudah ada
\l

# Keluar dari psql
\q
```

**Atau gunakan GUI (pgAdmin/DBeaver)**:
1. Klik kanan di Databases → Create → Database
2. Nama: `cloudapp`
3. Owner: `postgres`
4. Save

#### 2. Verifikasi Koneksi

```bash
# Test koneksi ke database
psql -U postgres -d cloudapp -c "SELECT version();"
```

### Step 7: Jalankan Backend Server

```bash
# Jalankan server (development mode dengan auto-reload)
uvicorn main:app --reload --port 8000

# Atau dengan host binding
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Output yang benar**:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 8: Test Backend

Buka browser dan akses:

- **Root API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc
- **Team Info**: http://localhost:8000/team

**Expected Response di root**:

```json
{
  "message": "Welcome to Cloud App API. Go to /docs for documentation."
}
```

### Penjelasan File Backend

#### 1. `main.py` - Entry Point

File utama yang mendefinisikan aplikasi FastAPI dan semua endpoints:

- **Imports**: FastAPI, CORS, database configs
- **App initialization**: `app = FastAPI(...)` dengan metadata
- **CORS middleware**: Mengizinkan frontend akses ke API
- **Endpoints**:
  - `GET /` - Welcome message
  - `GET /health` - Health check
  - `POST /items` - Create new item
  - `GET /items` - List items dengan pagination & search
  - `GET /items/stats` - Statistik inventory
  - `GET /items/{item_id}` - Get detail item
  - `PUT /items/{item_id}` - Update item
  - `DELETE /items/{item_id}` - Delete item
  - `GET /team` - Team information

#### 2. `database.py` - Database Configuration

Mengelola koneksi database:

- **load_dotenv()**: Load environment variables dari `.env`
- **create_engine()**: Membuat koneksi ke PostgreSQL
- **SessionLocal**: Session factory untuk database transactions
- **Base**: Base class untuk ORM models
- **get_db()**: Dependency injection untuk FastAPI endpoints

#### 3. `models.py` - Database Models

SQLAlchemy ORM models untuk tabel database:

**Model `Item`**:
- `id`: Integer, primary key, auto-increment
- `name`: String(100), required, indexed
- `description`: Text, optional
- `price`: Float, required
- `quantity`: Integer, default 0
- `created_at`: DateTime, auto-set saat create
- `updated_at`: DateTime, auto-update saat modify

#### 4. `schemas.py` - Pydantic Schemas

Data validation & serialization:

- **ItemBase**: Base schema dengan fields umum
- **ItemCreate**: Schema untuk POST request (create)
- **ItemUpdate**: Schema untuk PUT request (update) - semua field optional
- **ItemResponse**: Schema untuk response (include id & timestamps)
- **ItemListResponse**: Schema untuk list response dengan total count

#### 5. `crud.py` - Business Logic

Fungsi-fungsi untuk operasi database:

- `create_item()`: Insert item baru
- `get_items()`: Retrieve items dengan pagination & search
- `get_item()`: Retrieve single item by ID
- `update_item()`: Update item (partial update)
- `delete_item()`: Delete item by ID

---

## ⚛️ Setup Frontend

### Step 1: Masuk ke Folder Frontend

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
# Install semua package dari package.json
npm install

# Atau gunakan yarn
yarn install
```

**Yang terinstall**:
- React 19.2.0
- React DOM 19.2.0
- Vite 7.3.1
- ESLint dengan plugins
- Development dependencies

**Troubleshooting Install**:

```bash
# Jika npm install error, coba clear cache
npm cache clean --force
npm install

# Atau hapus node_modules dan install ulang
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules && del package-lock.json  # Windows
npm install
```

### Step 3: Konfigurasi Environment Variables

```bash
# Copy file template
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux
```

Edit file `.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

**Note**: Environment variables di Vite harus diawali dengan `VITE_` agar bisa diakses di browser.

### Step 4: Jalankan Development Server

```bash
# Jalankan Vite dev server
npm run dev

# Atau dengan custom port
npm run dev -- --port 3000
```

**Output yang benar**:

```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: Test Frontend

Buka browser dan akses: http://localhost:5173

**Yang harus terlihat**:
- ✅ Header dengan judul "☁️ Cloud App"
- ✅ Status "🟢 API Connected" (jika backend running)
- ✅ Form untuk tambah item
- ✅ Search bar
- ✅ Sort dropdown
- ✅ Message "Belum ada item" (jika database kosong)

### Penjelasan File Frontend

#### 1. `main.jsx` - Entry Point

React application entry point:

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

#### 2. `App.jsx` - Main Component

Component utama yang mengatur state dan logic:

**State Management**:
- `items`: Array of items dari backend
- `totalItems`: Total count items
- `loading`: Loading state
- `isConnected`: Status koneksi ke backend API
- `editingItem`: Item yang sedang di-edit
- `searchQuery`: Query untuk search
- `sortBy`: Sort option
- `toast`: Toast notification state

**Handlers**:
- `loadItems()`: Fetch items dari backend
- `handleSubmit()`: Create/update item
- `handleEdit()`: Set item untuk edit
- `handleDelete()`: Delete item
- `handleSearch()`: Search items
- `handleSortChange()`: Sort items

#### 3. `services/api.js` - API Service

Fungsi-fungsi untuk komunikasi dengan backend:

- `fetchItems()`: GET /items dengan query params
- `fetchItem(id)`: GET /items/{id}
- `createItem(data)`: POST /items
- `updateItem(id, data)`: PUT /items/{id}
- `deleteItem(id)`: DELETE /items/{id}
- `checkHealth()`: GET /health

#### 4. Components

**Header.jsx**:
- Menampilkan title dan stats
- Connection status indicator
- Total items badge

**ItemForm.jsx**:
- Form untuk create/edit item
- Validasi input
- State management untuk form data
- Error handling

**ItemList.jsx**:
- Container untuk list items
- Loading state
- Empty state message
- Grid layout

**ItemCard.jsx**:
- Display single item
- Format harga (Rupiah)
- Format tanggal
- Edit & Delete buttons

**SearchBar.jsx**:
- Input pencarian
- Submit & clear functionality
- Real-time search trigger

**SortBar.jsx**:
- Dropdown untuk sorting
- Options: nama, harga, tanggal

**Toast.jsx**:
- Notification component
- Auto-dismiss after 3 seconds
- Success/error variants
- Slide animation

#### 5. `vite.config.js` - Vite Configuration

```javascript
export default defineConfig({
  plugins: [react()],
})
```

Simple config yang menggunakan React plugin untuk JSX support.

---

## 🚀 Menjalankan Aplikasi

### Development Mode (Recommended)

Buka **2 terminal**:

#### Terminal 1 - Backend:

```bash
cd backend
# Aktifkan virtual environment jika belum
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux

# Jalankan backend
uvicorn main:app --reload --port 8000
```

#### Terminal 2 - Frontend:

```bash
cd frontend
# Jalankan frontend
npm run dev
```

### Verifikasi

1. **Backend Running**: http://localhost:8000/health harus return `{"status": "healthy"}`
2. **Frontend Running**: http://localhost:5173 harus tampil UI
3. **Connection Status**: Header di frontend harus menampilkan "🟢 API Connected"

### Production Build (Frontend)

```bash
cd frontend

# Build untuk production
npm run build

# Preview build
npm run preview

# Build output ada di folder: dist/
```

---

## 🗄️ Konfigurasi Database

### Schema Database

Backend akan otomatis membuat tabel saat pertama kali dijalankan (auto-migration via SQLAlchemy).

**Tabel `items`**:

| Column | Type | Attributes |
|--------|------|-----------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| name | VARCHAR(100) | NOT NULL, INDEXED |
| description | TEXT | NULLABLE |
| price | FLOAT | NOT NULL |
| quantity | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | ON UPDATE NOW() |

### Manual Table Creation (Opsional)

Jika ingin membuat tabel manual:

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_items_name ON items(name);
```

### Database Migration (Future)

Untuk production, gunakan **Alembic** untuk database migrations:

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Run migration
alembic upgrade head
```

### Backup & Restore Database

#### Backup:

```bash
pg_dump -U postgres -d cloudapp > backup.sql
```

#### Restore:

```bash
psql -U postgres -d cloudapp < backup.sql
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8000
```

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Welcome message | No |
| GET | `/health` | Health check | No |
| GET | `/team` | Team information | No |
| POST | `/items` | Create new item | No |
| GET | `/items` | List items (paginated) | No |
| GET | `/items/stats` | Inventory statistics | No |
| GET | `/items/{item_id}` | Get item detail | No |
| PUT | `/items/{item_id}` | Update item | No |
| DELETE | `/items/{item_id}` | Delete item | No |

### Detailed Endpoints

#### 1. POST /items - Create Item

**Request Body**:

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 5
}
```

**Response** (201 Created):

```json
{
  "id": 1,
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 5,
  "created_at": "2026-03-11T10:00:00Z",
  "updated_at": null
}
```

**Validations**:
- `name`: Required, 1-100 characters
- `price`: Required, must be > 0
- `quantity`: Optional, default 0, must be >= 0
- `description`: Optional

#### 2. GET /items - List Items

**Query Parameters**:
- `skip` (int): Offset for pagination (default: 0)
- `limit` (int): Items per page (default: 20, max: 100)
- `search` (string): Search in name/description

**Example**:

```
GET /items?skip=0&limit=10&search=laptop
```

**Response** (200 OK):

```json
{
  "total": 1,
  "items": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 15000000,
      "quantity": 5,
      "created_at": "2026-03-11T10:00:00Z",
      "updated_at": null
    }
  ]
}
```

#### 3. GET /items/stats - Statistics

**Response** (200 OK):

```json
{
  "total_items": 10,
  "total_value": 150000000,
  "most_expensive": {
    "name": "Laptop",
    "price": 15000000
  },
  "cheapest": {
    "name": "Mouse",
    "price": 50000
  }
}
```

#### 4. GET /items/{item_id} - Get Item

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 5,
  "created_at": "2026-03-11T10:00:00Z",
  "updated_at": null
}
```

**Error** (404 Not Found):

```json
{
  "detail": "Item dengan id=1 tidak ditemukan"
}
```

#### 5. PUT /items/{item_id} - Update Item

**Request Body** (partial update):

```json
{
  "price": 14000000,
  "quantity": 10
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 14000000,
  "quantity": 10,
  "created_at": "2026-03-11T10:00:00Z",
  "updated_at": "2026-03-11T11:00:00Z"
}
```

#### 6. DELETE /items/{item_id} - Delete Item

**Response** (204 No Content):

```
(empty body)
```

**Error** (404 Not Found):

```json
{
  "detail": "Item dengan id=1 tidak ditemukan"
}
```

---

## 🧪 Testing

### Backend Testing (Manual)

#### 1. Gunakan Swagger UI

1. Buka http://localhost:8000/docs
2. Klik endpoint yang ingin ditest
3. Klik "Try it out"
4. Isi parameter/body
5. Klik "Execute"
6. Lihat response

#### 2. Gunakan cURL

**Health Check**:

```bash
curl http://localhost:8000/health
```

**Create Item**:

```bash
curl -X POST "http://localhost:8000/items" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 15000000,
    "description": "Laptop untuk cloud computing",
    "quantity": 5
  }'
```

**Get Items**:

```bash
curl http://localhost:8000/items
```

**Get Item by ID**:

```bash
curl http://localhost:8000/items/1
```

**Update Item**:

```bash
curl -X PUT "http://localhost:8000/items/1" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 14000000
  }'
```

**Delete Item**:

```bash
curl -X DELETE "http://localhost:8000/items/1"
```

#### 3. Gunakan Postman/Insomnia

- Import collection dari dokumentasi
- Set base URL: `http://localhost:8000`
- Test setiap endpoint
- Lihat response dan status code

### Frontend Testing (Manual)

#### 1. UI Testing Checklist

- [ ] Page loading tampil dengan benar
- [ ] Header menampilkan jumlah items
- [ ] Connection status showing "Connected"
- [ ] Form validation bekerja (required fields)
- [ ] Create item berhasil dan muncul toast
- [ ] Item baru muncul di list
- [ ] Edit item mengisi form dengan data benar
- [ ] Update item berhasil dan muncul toast
- [ ] Search item berfungsi
- [ ] Sort item berfungsi (nama, harga, tanggal)
- [ ] Delete item dengan konfirmasi
- [ ] Delete berhasil dan item hilang dari list
- [ ] Empty state tampil saat tidak ada data
- [ ] Loading state tampil saat fetch data
- [ ] Toast auto-dismiss setelah 3 detik
- [ ] Responsive di berbagai ukuran layar

#### 2. Browser Console

Buka Developer Tools (F12) dan cek:

- **Console**: Tidak ada error (kecuali normal React warnings)
- **Network**: API calls sukses (status 200/201/204)
- **Elements**: DOM structure benar
- **Performance**: Load time reasonable

### Automated Testing (Future Implementation)

#### Backend (pytest):

```bash
# Install pytest
pip install pytest pytest-cov

# Create tests/test_main.py
# Run tests
pytest

# With coverage
pytest --cov=. --cov-report=html
```

#### Frontend (Vitest):

```bash
# Install Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Add test script to package.json
# "test": "vitest"

# Run tests
npm test
```

---

## 🔧 Troubleshooting

### Backend Issues

#### Issue 1: `DATABASE_URL tidak ditemukan di .env!`

**Solusi**:

```bash
# Pastikan file .env ada di folder backend
cd backend
ls .env  # macOS/Linux
dir .env  # Windows

# Jika tidak ada, copy dari .env.example
cp .env.example .env

# Edit .env dan set DATABASE_URL
```

#### Issue 2: `psycopg2.OperationalError: could not connect to server`

**Penyebab**: PostgreSQL service tidak running

**Solusi Windows (Laragon)**:

```
1. Buka Laragon
2. Klik tombol "Start All"
3. Pastikan PostgreSQL icon hijau (running)
```

**Solusi macOS/Linux**:

```bash
# Check status
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql
```

#### Issue 3: `ImportError: No module named 'fastapi'`

**Penyebab**: Virtual environment tidak aktif atau dependencies belum terinstall

**Solusi**:

```bash
# Aktifkan virtual environment
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

#### Issue 4: `Port 8000 already in use`

**Solusi**:

```bash
# Windows: Kill process di port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Atau gunakan port lain
uvicorn main:app --reload --port 8001
```

#### Issue 5: `CORS error di browser console`

**Penyebab**: Frontend URL tidak di-allowed di backend

**Solusi**: Edit `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Issues

#### Issue 1: `npm install` error

**Solusi**:

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Install ulang
npm install

# Jika masih error, coba dengan flag legacy
npm install --legacy-peer-deps
```

#### Issue 2: `Cannot find module 'vite'`

**Solusi**:

```bash
# Install ulang dependencies
npm install

# Atau install vite specifically
npm install vite --save-dev
```

#### Issue 3: `API Disconnected` di header

**Penyebab**: Backend tidak running atau URL salah

**Solusi**:

```bash
# 1. Pastikan backend running
curl http://localhost:8000/health

# 2. Cek .env di frontend
cat .env  # macOS/Linux
type .env  # Windows

# Harus berisi:
# VITE_API_URL=http://localhost:8000

# 3. Restart dev server
npm run dev
```

#### Issue 4: `fetch failed - Network error`

**Solusi**:

1. Cek backend running: http://localhost:8000/health
2. Cek CORS enabled di backend
3. Cek browser console untuk detail error
4. Cek firewall tidak block port 8000
5. Cek .env VITE_API_URL menggunakan `http://` bukan `https://`

#### Issue 5: Port 5173 already in use

**Solusi**:

```bash
# Gunakan port lain
npm run dev -- --port 3000

# Atau kill process
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### Database Issues

#### Issue 1: `password authentication failed`

**Solusi**:

```bash
# 1. Reset password PostgreSQL
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
\q

# 2. Update .env
DATABASE_URL=postgresql://postgres:new_password@localhost:5432/cloudapp
```

#### Issue 2: `database "cloudapp" does not exist`

**Solusi**:

```bash
# Buat database
psql -U postgres
CREATE DATABASE cloudapp;
\q

# Atau
createdb -U postgres cloudapp
```

#### Issue 3: `relation "items" does not exist`

**Penyebab**: Tabel belum dibuat

**Solusi**: Restart backend, SQLAlchemy akan auto-create tables:

```bash
cd backend
uvicorn main:app --reload
```

---

## 💡 Best Practices

### Development Workflow

1. **Selalu gunakan virtual environment** untuk Python
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   ```

2. **Commit .env.example, jangan commit .env**
   - `.env` berisi credentials sensitive
   - `.env.example` sebagai template untuk team

3. **Format code secara konsisten**
   ```bash
   # Python (backend)
   pip install black
   black .

   # JavaScript (frontend)
   npm run lint
   ```

4. **Run tests sebelum commit**
   ```bash
   # Backend
   pytest

   # Frontend
   npm test
   ```

5. **Gunakan meaningful commit messages**
   ```bash
   git commit -m "feat: add search functionality to items endpoint"
   git commit -m "fix: resolve CORS issue in frontend API calls"
   git commit -m "docs: update setup guide with troubleshooting section"
   ```

### Code Organization

#### Backend:

- **Separation of Concerns**: 
  - `models.py` = Database structure
  - `schemas.py` = API contracts
  - `crud.py` = Business logic
  - `main.py` = API routes

- **Error Handling**: Always use try-catch dan return meaningful errors

- **Validation**: Use Pydantic untuk automatic validation

#### Frontend:

- **Component Separation**: Satu component untuk satu responsibility

- **API Layer**: Semua API calls di `services/api.js`

- **State Management**: Use hooks (useState, useEffect, useCallback)

- **Styling**: Inline styles di file yang sama (untuk project kecil)

### Security Considerations

1. **Never commit sensitive data**:
   - Database credentials
   - API keys
   - Secret keys

2. **Use environment variables** untuk semua configs

3. **Validate all user inputs** (backend dan frontend)

4. **Use HTTPS** di production

5. **Implement authentication** untuk production app

6. **Keep dependencies updated**:
   ```bash
   # Backend
   pip list --outdated
   pip install --upgrade <package>

   # Frontend
   npm outdated
   npm update
   ```

---

## 👥 Tim Pengembang

| Nama | NIM | Role | Responsibilities |
|------|-----|------|------------------|
| **Muhammad Athala Romero** | 10231059 | Lead Backend | Backend API, Database Design, FastAPI Implementation |
| **Muhammad Bagas Setiawan** | 10231061 | Lead Frontend | React UI, Component Design, Frontend Integration |
| **Muhammad Fikri Haikal Ariadma** | 10231063 | Lead DevOps | Docker, Deployment, Infrastructure |
| **Nanda Aulia Putri** | 10231067 | Lead QA & Docs | Testing, Documentation, Quality Assurance |

### Contact & Support

Untuk pertanyaan atau issues:

1. Buat issue di GitHub repository
2. Atau hubungi team lead terkait
3. Check dokumentasi di folder `docs/`

---

## 📝 Appendix

### Useful Commands Reference

#### Git:

```bash
# Clone repository
git clone <repo-url>

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b feature/new-feature

# Merge branch
git checkout main
git merge feature/new-feature
```

#### Python/Backend:

```bash
# Create virtual env
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Deactivate
deactivate

# Install packages
pip install <package>

# Install from requirements
pip install -r requirements.txt

# Freeze installed packages
pip freeze > requirements.txt

# Run server
uvicorn main:app --reload
```

#### Node/Frontend:

```bash
# Install dependencies
npm install

# Install specific package
npm install <package>

# Install dev dependency
npm install -D <package>

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Update packages
npm update
```

#### PostgreSQL:

```bash
# Login to psql
psql -U postgres

# List databases
\l

# Connect to database
\c cloudapp

# List tables
\dt

# Describe table
\d items

# Run SQL file
\i file.sql

# Quit
\q

# Backup database
pg_dump -U postgres cloudapp > backup.sql

# Restore database
psql -U postgres cloudapp < backup.sql
```

### Environment Variables Reference

#### Backend `.env`:

```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database

# Optional (for future features)
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend `.env`:

```env
# Required
VITE_API_URL=http://localhost:8000
```

## 🎉 Selesai!

