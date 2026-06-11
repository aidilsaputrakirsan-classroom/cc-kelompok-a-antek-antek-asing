# Release Notes - Modul 15: Final Polish

## Security Hardening
- Dipindahkannya semua kredensial yang sebelumnya tertanam dalam _source code_ ke file *Environment Variables* (`.env`).
- Ditambahkannya perlindungan `limit_req_zone` di tingkat *Nginx Gateway* untuk melindungi titik akhir dari *brute force* dan *DoS* (`5r/s` di auth, `20r/s` di API utama).
- Peningkatan batas kekuatan `password` di `auth-service` untuk memerlukan kombinasi spesifik: 1 huruf besar, 1 angka, dan batasan panjang 128 karakter.
- Diimplementasikan perlindungan terhadap *integer overflow* di `item-service` dengan membatasi properti `quantity` hingga maksimum 10.000.

## Monitoring Improvements
- Penyempurnaan *Health Checks* untuk dapat diekspos melalui Gateway.
- Ditambahkannya *Structured Logging* dengan metadata yang persisten untuk membantu _tracing_ log di *production*.

## Reliability Improvements
- Mengubah referensi `nginx:alpine` yang rentan mengalami *breaking changes* menjadi versi *pinned* yaitu `nginx:1.25-alpine`.
- Perbaikan *Pydantic schemas* untuk mengakomodasi payload panjang: penambahan batas karakter `name` hingga 300, dan `description` hingga 2000 karakter di *Item Service*.

## Documentation Improvements
- *README.md* sekarang menampilkan arsitektur *microservices* terkini beserta instruksi *Docker Compose* yang jelas.
- Dokumentasi *API Contract* telah diperbarui ke `api-contract.md` agar tim *Frontend* bisa berintegrasi dengan lebih mudah.
- Seluruh endpoint krusial kini memiliki *module-level docstrings*.
