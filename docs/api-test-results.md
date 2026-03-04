# API Test Results

Pengujian dilakukan menggunakan Swagger UI pada:
http://127.0.0.1:8000/docs
![Foto hasil endpoint](images/week2/1.swagger-ui-dashboard.png)

---

## 1. GET /health
Status: 200 OK  
Hasil: API berjalan dengan baik.

![Foto hasil endpoint](images//week2/2.get-health.png)

---

## 2. POST /items
Status: 201 Created  
Hasil: Item berhasil ditambahkan ke database.

![Foto hasil endpoint](images/week2/3.keyboard-json.png)
![Foto hasil endpoint](images/week2/3.laptop-json.png)
![Foto hasil endpoint](images/week2/3.mouse-json.png)

---

## 3. GET /items
Status: 200 OK  
Hasil: Daftar item berhasil ditampilkan.

![Foto hasil endpoint](images/week2/4.get-items.png)

---

## 4. GET /items/stats
Status: 200 OK  
Hasil: Statistik inventory berhasil ditampilkan (total_items, total_value, most_expensive, cheapest).

![Foto hasil endpoint](images/week2/5.get-items-stats.png)

---

## 5. GET /items/{item_id}
Status: 200 OK  
Hasil: Detail item berhasil ditampilkan.

![Foto hasil endpoint](images/week2/6.get-items-(item_id).png)

---

## 6. PUT /items/{item_id}
Status: 200 OK  
Hasil: Data item berhasil diperbarui.

![Foto hasil endpoint](images/week2/7.put-items-(item_id).png)

---

## 7. DELETE /items/{item_id}
Status: 204 No Content  
Hasil: Item berhasil dihapus.

![Foto hasil endpoint](images/week2/8.delete-items-(item_id).png)

---



## 8. GET /team
Status: 200 OK  
Hasil: Informasi tim berhasil ditampilkan.

![Foto hasil endpoint](images/week2/9.get-team.png)

---

## Kesimpulan

Semua endpoint berhasil diuji dan berjalan sesuai spesifikasi tanpa error.