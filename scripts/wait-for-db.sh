#!/bin/bash
# scripts/wait-for-db.sh

echo "⏳ Menunggu database PostgreSQL siap..."

# Maksimal percobaan (30 detik)
MAX_RETRIES=30
RETRY_COUNT=0

# Menggunakan perintah pg_isready dari dalam container db
until docker exec db pg_isready -U postgres -d cloudapp >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ Timeout! Database tidak kunjung siap setelah $MAX_RETRIES detik."
    exit 1
  fi
  echo "    [$(date +%H:%M:%S)] Database belum siap, mencoba lagi dalam 1 detik..."
  sleep 1
done

echo "✅ Database PostgreSQL sudah siap menerima koneksi!"
