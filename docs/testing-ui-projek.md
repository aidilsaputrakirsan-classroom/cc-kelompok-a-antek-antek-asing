Berikut hasil dokumentasi 22 skenario pengujian

---

## 1. Pengujian Login Sebelum Approval

User tidak dapat login karena akun belum disetujui oleh admin/superadmin.

Hasil:  
Sistem berhasil menolak login dan menampilkan pesan bahwa akun belum di-approval.

![Screenshot](images//Testing/Testcase1.png)

---

## 2. Pengujian Validasi Password saat Register

User memasukkan password yang tidak sesuai dengan ketentuan.

Hasil:  
Sistem menampilkan pesan error bahwa password tidak valid.

![Screenshot](images//Testing/Testcase2.png)

---

## 3. Pengujian Format Email saat Register

User memasukkan format email yang tidak sesuai.

Hasil:  
Sistem menampilkan validasi error pada field email.

![Screenshot](images//Testing/Testcase3.png)

---

## 4. Pengujian Notifikasi Permintaan User

Admin menerima notifikasi saat ada user baru melakukan registrasi.

Hasil:  
Notifikasi berhasil muncul pada sistem.

![Screenshot](images//Testing/Testcase4.png)

---

## 5. Pengujian Approval User pada Dashboard

Admin dapat menerima atau menolak user pada halaman waiting approval.

Hasil:  
Fitur approve dan reject berjalan dengan baik.

![Screenshot](images//Testing/Testcase5.png)

---

## 6. Pengujian Penanda User Disetujui

User yang telah disetujui memiliki penanda/status pada dashboard.

Hasil:  
Status user berubah sesuai aksi approval.

![Screenshot](images//Testing/Testcase6.png)

---

## 7. Pengujian Penolakan User

Admin menolak user yang mendaftar.

Hasil:  
Sistem menampilkan notifikasi bahwa user telah ditolak.

![Screenshot](images//Testing/Testcase7.png)

---

## 8. Pengujian Notifikasi Penolakan pada Form Register

User yang ditolak mendapatkan informasi saat mencoba login/register kembali.

Hasil:  
Sistem menampilkan pemberitahuan bahwa email ditolak.

![Screenshot](images//Testing/Testcase8.png)

---

## 9. Pengujian Pemilihan Departemen User

Admin dan superadmin dapat memilih departemen untuk user.

Hasil:  
Departemen berhasil disimpan sesuai pilihan.

![Screenshot](images//Testing/Testcase9.png)

---

## 10. Pengujian Perubahan Role dan Departemen

Superadmin dapat mengubah role dan departemen user.

Hasil:  
Perubahan data berhasil disimpan.

![Screenshot](images//Testing/Testcase10.png)

---

## 11. Pengujian Update Status Ticket

Admin/IT dapat mengubah status pengerjaan ticket dan menentukan penyelesai.

Hasil:  
Status dan assignee ticket berhasil diperbarui.

![Screenshot](images//Testing/Testcase11.png)

---

## 12. Pengujian Penolakan Email oleh Admin

Admin/superadmin menolak email user.

Hasil:  
Email tidak dapat digunakan untuk login.

![Screenshot](images//Testing/Testcase12.png)

---

## 13. Pengujian Pembuatan Ticket oleh Employee

Employee membuat ticket baru.

Hasil:  
Ticket berhasil dibuat dan tersimpan dalam sistem.

![Screenshot](images//Testing/Testcase13.png)

---

## 14. Pengujian Edit Ticket oleh Employee

Employee mengedit ticket yang telah dibuat.

Hasil:  
Perubahan berhasil disimpan.

![Screenshot](images//Testing/Testcase14.png)

---

## 15. Pengujian Verifikasi Edit Ticket

Data ticket yang telah diedit diperbarui pada sistem.

Hasil:  
Perubahan data tampil sesuai update.

![Screenshot](images//Testing/Testcase15.png)

---

## 16. Pengujian Detail Ticket

Employee dapat melihat detail ticket.

Hasil:  
Detail ticket ditampilkan dengan benar.

![Screenshot](images//Testing/Testcase16.png)

---

## 17. Pengujian History Ticket

Employee dapat melihat riwayat pengerjaan ticket.

Hasil:  
History tampil sesuai aktivitas.

![Screenshot](images//Testing/Testcase17.png)

---

## 18. Pengujian Notifikasi Aktivitas User

User menerima notifikasi ketika terdapat aktivitas terkait ticket.

Hasil:  
Notifikasi muncul sesuai event.

![Screenshot](images//Testing/Testcase18.png)

---

## 19. Pengujian Perubahan Avatar

User dapat mengganti avatar profile.

Hasil:  
Avatar berhasil diperbarui.

![Screenshot](images//Testing/Testcase19.png)

---

## 20. Pengujian Kombinasi Filter Ticket

User menggunakan kombinasi filter (status, priority, assignee).

Hasil:  
Data yang ditampilkan sesuai dengan kombinasi filter.

![Screenshot](images//Testing/Testcase20.png)

---

## 21. Pengujian Login dengan Email Belum Terdaftar

User mencoba login menggunakan email yang belum terdaftar pada sistem.

Hasil:  
Sistem menolak login dan menampilkan pesan bahwa email belum terdaftar.

![Screenshot](images//Testing/Testcase21.png)

---

## 22. Pengujian Notifikasi Permintaan Ticket

Admin/IT menerima notifikasi ketika terdapat ticket baru dari employee.

Hasil:  
Notifikasi berhasil muncul sebagai pemberitahuan adanya permintaan ticket baru.

![Screenshot](images//Testing/Testcase22.png)

---