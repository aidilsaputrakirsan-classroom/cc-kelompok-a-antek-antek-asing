# ============================================================
# Stage 1: Install dependencies (Builder)
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /app
COPY requirements.txt .

# Buat virtual environment khusus di dalam container
RUN python -m venv /opt/venv

# Pastikan pip berjalan di dalam venv tersebut
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies ke dalam venv
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================
# Stage 2: Production (Final Image yang Sangat Ringan)
# ============================================================
FROM python:3.12-slim

WORKDIR /app

# 1. COPY HANYA virtual environment dari Stage 1 (Tinggalkan sampah build-nya)
COPY --from=builder /opt/venv /opt/venv

# Pastikan aplikasi pakai python dari venv
ENV PATH="/opt/venv/bin:$PATH"

# 2. COPY kode aplikasi Boss
COPY . .

# Install curl untuk healthcheck command
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# 3. Setup Keamanan Non-Root (Sesuai PDF)
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# 4. Fitur Pendeteksi Jantung (Healthcheck)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 5. Jalankan Aplikasi
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]