"""
Data Migration Script — Antick Async
Migrasi data dari database monolith (1 DB: cloudapp) ke arsitektur
microservices (2 DB: auth_db & item_db).

Diadaptasi dari Modul 13 Workshop 13.3 untuk schema asli project ini:
  - auth_db : departments, users, categories, tickets, notifications, approval_logs
  - item_db : items

Perbedaan penting dari script modul (alasan adaptasi):
  1. Menyalin SEMUA kolom yang beririsan antara tabel sumber & tujuan
     (schema users project ini punya role/status/approval, bukan hanya 4 kolom).
  2. users.approved_by (self-FK) diisi lewat UPDATE pass kedua agar tidak
     melanggar foreign key saat urutan ID tidak berurutan.
  3. Sequence PostgreSQL di-reset (setval) setelah insert ID eksplisit —
     tanpa ini, INSERT berikutnya dari aplikasi akan bentrok duplicate key.
  4. Idempotent: ON CONFLICT (id) DO NOTHING — aman dijalankan ulang.

Usage:
    # Default mengikuti port docker-compose.dev.yml (auth-db 5433, item-db 5434)
    python scripts/migrate_data.py

    # Atau override koneksi via environment variables:
    MONOLITH_DB_URL=postgresql://user:pass@host:5432/cloudapp \
    AUTH_DB_URL=postgresql://postgres:postgres123@localhost:5433/auth_db \
    ITEM_DB_URL=postgresql://postgres:postgres123@localhost:5434/item_db \
    python scripts/migrate_data.py

Prerequisite:
    - pip install sqlalchemy "psycopg[binary]"
    - Database tujuan sudah running & tabel sudah dibuat
      (startup auth-service/item-service membuat tabel otomatis).
    - Jalankan dengan: docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
      agar port database terekspos ke host.
"""
import os
import sys
from sqlalchemy import create_engine, inspect, text

MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/cloudapp",
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql+psycopg://postgres:postgres123@localhost:5433/auth_db",
)
ITEM_DB_URL = os.getenv(
    "ITEM_DB_URL",
    "postgresql+psycopg://postgres:postgres123@localhost:5434/item_db",
)

# Urutan tabel auth_db mengikuti dependensi foreign key.
# users.approved_by sengaja ditunda ke pass kedua (lihat migrate_users).
AUTH_TABLES = ["departments", "users", "categories", "tickets", "notifications", "approval_logs"]
ITEM_TABLES = ["items"]


def common_columns(src_engine, dst_engine, table: str) -> list[str]:
    """Kolom yang ada di tabel sumber DAN tujuan (schema bisa berbeda versi)."""
    src_cols = {c["name"] for c in inspect(src_engine).get_columns(table)}
    dst_cols = {c["name"] for c in inspect(dst_engine).get_columns(table)}
    return sorted(src_cols & dst_cols)


def copy_table(src_engine, dst_engine, table: str, skip_columns: set[str] | None = None) -> int:
    """Salin isi tabel (kolom beririsan) dengan ON CONFLICT (id) DO NOTHING."""
    cols = common_columns(src_engine, dst_engine, table)
    if skip_columns:
        cols = [c for c in cols if c not in skip_columns]
    if "id" not in cols:
        print(f"     ⏭️  {table}: tidak punya kolom id yang sama — dilewati")
        return 0

    col_list = ", ".join(cols)
    placeholders = ", ".join(f":{c}" for c in cols)
    insert_sql = text(
        f"INSERT INTO {table} ({col_list}) VALUES ({placeholders}) "
        f"ON CONFLICT (id) DO NOTHING"
    )

    with src_engine.connect() as src:
        rows = src.execute(text(f"SELECT {col_list} FROM {table}")).mappings().all()

    if not rows:
        print(f"     ⏭️  {table}: kosong di monolith — dilewati")
        return 0

    with dst_engine.begin() as dst:
        for row in rows:
            dst.execute(insert_sql, dict(row))

    print(f"     ✅ {table}: {len(rows)} baris dimigrasi")
    return len(rows)


def migrate_users(src_engine, dst_engine) -> int:
    """
    Migrasi users dalam 2 pass:
      pass 1: insert semua user TANPA approved_by (hindari self-FK error)
      pass 2: UPDATE approved_by setelah semua user ada
    """
    count = copy_table(src_engine, dst_engine, "users", skip_columns={"approved_by"})
    if count == 0:
        return 0

    with src_engine.connect() as src:
        approvals = src.execute(
            text("SELECT id, approved_by FROM users WHERE approved_by IS NOT NULL")
        ).mappings().all()

    if approvals:
        with dst_engine.begin() as dst:
            for row in approvals:
                dst.execute(
                    text("UPDATE users SET approved_by = :approved_by WHERE id = :id"),
                    dict(row),
                )
        print(f"     ✅ users.approved_by: {len(approvals)} relasi approval dipulihkan")
    return count


def reset_sequences(engine, tables: list[str]):
    """Sinkronkan sequence autoincrement dengan MAX(id) setelah insert eksplisit."""
    with engine.begin() as conn:
        for table in tables:
            conn.execute(text(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM {table}), 0) + 1, false)"
            ))
    print(f"     🔄 Sequence di-reset untuk: {', '.join(tables)}")


def table_exists(engine, table: str) -> bool:
    return table in inspect(engine).get_table_names()


def migrate():
    print("=" * 56)
    print("DATA MIGRATION: Monolith (cloudapp) → Microservices")
    print("=" * 56)

    monolith = create_engine(MONOLITH_DB_URL)
    auth_db = create_engine(AUTH_DB_URL)
    item_db = create_engine(ITEM_DB_URL)

    # --- [1/2] auth_db ---
    print("\n[1/2] Migrasi → auth_db ...")
    migrated_auth = []
    for table in AUTH_TABLES:
        if not table_exists(monolith, table):
            print(f"     ⏭️  {table}: tidak ada di monolith — dilewati")
            continue
        if not table_exists(auth_db, table):
            print(f"     ⚠️  {table}: belum ada di auth_db (jalankan auth-service dulu) — dilewati")
            continue
        if table == "users":
            n = migrate_users(monolith, auth_db)
        else:
            n = copy_table(monolith, auth_db, table)
        if n:
            migrated_auth.append(table)
    if migrated_auth:
        reset_sequences(auth_db, migrated_auth)

    # --- [2/2] item_db ---
    print("\n[2/2] Migrasi → item_db ...")
    migrated_item = []
    for table in ITEM_TABLES:
        if not table_exists(monolith, table):
            print(f"     ⏭️  {table}: tidak ada di monolith — dilewati")
            continue
        if not table_exists(item_db, table):
            print(f"     ⚠️  {table}: belum ada di item_db (jalankan item-service dulu) — dilewati")
            continue
        n = copy_table(monolith, item_db, table)
        if n:
            migrated_item.append(table)
    if migrated_item:
        reset_sequences(item_db, migrated_item)

    print("\n" + "=" * 56)
    print("MIGRATION COMPLETE!")
    print("=" * 56)


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print("Pastikan semua database accessible dan tabel tujuan sudah dibuat.")
        sys.exit(1)
