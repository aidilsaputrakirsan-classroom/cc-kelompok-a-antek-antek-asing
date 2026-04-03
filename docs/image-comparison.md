# Perbandingan Ukuran Base Image Python

Hasil pengukuran lokal menggunakan `docker image ls`.

| Base Image | Ukuran |
| --- | --- |
| `python:3.12` | `1.62GB` |
| `python:3.12-slim` | `179MB` |
| `python:3.12-alpine` | `75MB` |

## Analisis

1. `python:3.12` paling besar dan kurang efisien untuk backend production sederhana.
2. `python:3.12-slim` jauh lebih ringan dengan kompatibilitas package yang umumnya aman.
3. `python:3.12-alpine` paling kecil, tetapi bisa menambah kompleksitas saat ada dependency native tertentu.

## Kesimpulan

Base image yang dipilih untuk backend proyek ini adalah `python:3.12-slim` karena paling seimbang antara ukuran image dan stabilitas runtime.