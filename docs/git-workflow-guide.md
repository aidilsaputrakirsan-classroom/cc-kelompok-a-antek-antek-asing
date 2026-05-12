# Git Workflow Guide 
Dokumen ini menjelaskan mengenai standar workflow Git yang digunakan oleh tim untuk memastikan bahwa penggabungan antar individu sesuai dan berjalan dengan rapi serta terstruktur.

---

## 1. Branch Naming Convention

Penamaan branch harus jelas dan sesuai sehingga memudahkan tracking pekerjaan dan memahami isi branch tanpa membuka kode:

| Tipe | Format | Contoh |
|------|-------|--------|
| Feature | feature/nama-fitur | feature/dark-mode |
| Bug Fix | fix/nama-bug | fix/login-error |
| Documentation | docs/nama-dokumen | docs/git-workflow |
| Chore | chore/nama-task | chore/add-codeowners |
| Conflict Simulation | conflict/nama | conflict/edit-readme |

---

## 2. Commit Message Convention

Menggunakan format Conventional Commits

### Tipe yang digunakan:
- `feat:` → fitur baru  
- `fix:` → perbaikan bug  
- `docs:` → dokumentasi  
- `chore:` → konfigurasi / task kecil  
- `refactor:` → perbaikan struktur kode  

### Contoh:

feat: add dark mode toggle
fix: resolve login validation error
docs: add git workflow documentation
chore: add CODEOWNERS file

---

## 3. Workflow Pengembangan (Branch → PR → Merge)

### Langkah-langkah:

1. Ambil update terbaru dari main

git checkout main
git pull origin main


2. Buat branch baru

git checkout -b feature/nama-fitur


3. Kerjakan fitur / perubahan

4. Commit perubahan

git add .
git commit -m "feat: deskripsi perubahan"


5. Push ke repository

git push origin feature/nama-fitur


6. Buat Pull Request (PR) di GitHub

---

## 4. Pull Request (PR) Guidelines

Setiap PR wajib memenuhi:

- Title sesuai Conventional Commits
- Deskripsi menjelaskan perubahan
- Assign reviewer
- Tidak langsung merge tanpa review

### Contoh PR Description:

Deskripsi

Menambahkan fitur dark mode pada aplikasi frontend.

Perubahan <br>
Menambahkan notifikasi <br>
Menyimpan preferensi di localStorage<br>
Checklist <br>
sudah ditest dan tidak ada error

---
## 5. Code Review Guidelines

Setiap PR harus direview oleh minimal 1 anggota tim.

### Reviewer wajib:
- Membaca perubahan kode
- Memberikan minimal 3 komentar

### Jenis komentar:
- 👍 Praise → apresiasi
- 💡 Suggestion → saran perbaikan
- ❓ Question → pertanyaan

### Contoh:
- "Struktur kode sudah rapi 👍"
- "Sebaiknya tambahkan validasi input di sini"
- "Kenapa menggunakan pendekatan ini?"
---

## 6. Merge Strategy

Setelah PR di-approve:

- Gunakan Squash and Merge
- Hapus branch setelah merge
---
## 7. Branch Protection Rules

Branch main dilindungi dengan aturan:

- Tidak boleh push langsung
- Wajib melalui Pull Request
- Minimal 1 approval sebelum merge
- Tidak boleh force push

---

## 8. Best Practices

- Selalu *pull* sebelum mulai kerja
- Jangan bekerja langsung di branch *main*
- Buat PR untuk setiap perubahan
- Hindari merge conflict dengan update branch secara rutin
- Gunakan commit message yang jelas

---

## 🎯 Kesimpulan

Workflow Git ini bertujuan untuk:
- Meningkatkan kolaborasi tim
- Menjaga kualitas kode
- Menghindari konflik dan kesalahan
- Membuat proses development lebih terstruktur