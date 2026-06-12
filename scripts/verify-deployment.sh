#!/bin/bash
# ============================================
# Final Verification — Antick Async (Modul 15)
# ============================================
# Cek menyeluruh kondisi deployment: container, health, dan endpoint publik.
#
# Usage:
#   ./scripts/verify-deployment.sh                              # cek lokal (http://localhost)
#   ./scripts/verify-deployment.sh https://api.antick-async.online  # cek production
#
# Exit code 0 = semua hijau; 1 = ada yang gagal.

BASE_URL="${1:-http://localhost}"
FAIL=0

check() {
  local label="$1" url="$2" expected="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [ "$code" = "$expected" ]; then
    echo "  ✅ $label → HTTP $code"
  else
    echo "  ❌ $label → HTTP $code (expected $expected)"
    FAIL=1
  fi
}

echo "============================================"
echo "  FINAL VERIFICATION — $BASE_URL"
echo "============================================"

# 1. Containers (hanya relevan untuk cek lokal)
if [ "$BASE_URL" = "http://localhost" ]; then
  echo ""
  echo "[1] Docker containers..."
  TOTAL=$(docker compose ps --services 2>/dev/null | wc -l)
  RUNNING=$(docker compose ps --status running --services 2>/dev/null | wc -l)
  echo "  Running: $RUNNING/$TOTAL services"
  if [ "$RUNNING" -lt "$TOTAL" ]; then
    echo "  ❌ Ada service yang tidak running:"
    docker compose ps -a --format "    {{.Name}}: {{.Status}}"
    FAIL=1
  else
    echo "  ✅ Semua service running"
  fi
fi

# 2. Health endpoints
echo ""
echo "[2] Health endpoints..."
check "Gateway      /health" "$BASE_URL/health"
check "Auth Service /auth/health" "$BASE_URL/auth/health"
check "Item Service /items/health" "$BASE_URL/items/health"

# 3. Metrics endpoints
echo ""
echo "[3] Metrics endpoints..."
check "Auth metrics /auth/metrics" "$BASE_URL/auth/metrics"
check "Item metrics /items/metrics" "$BASE_URL/items/metrics"

# 4. Frontend & API surface
echo ""
echo "[4] Frontend & API..."
if [ "$BASE_URL" = "http://localhost" ]; then
  check "Frontend SPA /" "$BASE_URL/"
else
  check "Frontend SPA (https://antick-async.online)" "https://antick-async.online/"
fi
check "Items tanpa token (harus 401)" "$BASE_URL/items" 401
check "Auth docs /auth/docs" "$BASE_URL/auth/docs"

echo ""
echo "============================================"
if [ "$FAIL" -eq 0 ]; then
  echo "  ✅ VERIFICATION PASSED — siap demo!"
else
  echo "  ❌ VERIFICATION FAILED — cek item di atas."
fi
echo "============================================"
exit $FAIL
