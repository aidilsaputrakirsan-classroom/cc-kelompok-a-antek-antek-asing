import { useState, useEffect, useCallback } from "react";
import ItemForm from "../components/ItemForm";
import ItemList from "../components/ItemList";
import { itemApi } from "../services/api";
import { useToast } from "../context/useToast";
import { useConfirm } from "../context/ConfirmContext";
import { Package, TrendingUp, DollarSign, Award, RefreshCw, AlertTriangle } from "lucide-react";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total_items: 0,
    total_value: 0.0,
    highest_price: null,
    lowest_price: null,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState("");

  const { addToast } = useToast();
  const confirm = useConfirm();

  // Fetch Items list and Stats
  const fetchData = useCallback(async (searchVal = searchQuery) => {
    setLoading(true);
    setStatsLoading(true);
    setError("");
    setIsOffline(false);

    try {
      // Fetch both items list and stats in parallel
      const [itemList, itemStats] = await Promise.all([
        itemApi.list({ search: searchVal }),
        itemApi.stats(),
      ]);

      setItems(itemList || []);
      setStats(
        itemStats || {
          total_items: 0,
          total_value: 0.0,
          highest_price: null,
          lowest_price: null,
        }
      );
    } catch (err) {
      console.error("Fetch items error:", err);
      if (err.message === "Service temporarily unavailable" || err.status === 503 || err.status === 502) {
        setIsOffline(true);
      } else {
        setError(err.message || "Gagal mengambil data inventory.");
        addToast({
          type: "error",
          message: err.message || "Gagal mengambil data.",
        });
      }
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [searchQuery, addToast]);

  // Initial load and search triggers
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (itemData, itemId) => {
    setSubmitting(true);
    try {
      if (itemId) {
        // Update item
        await itemApi.update(itemId, itemData);
        addToast({
          type: "success",
          message: "Item berhasil diperbarui!",
        });
        setEditingItem(null);
      } else {
        // Create item
        await itemApi.create(itemData);
        addToast({
          type: "success",
          message: "Item baru berhasil ditambahkan!",
        });
      }
      fetchData(); // Reload list and statistics
    } catch (err) {
      if (err.message === "Service temporarily unavailable" || err.status === 503 || err.status === 502) {
        setIsOffline(true);
      } else {
        addToast({
          type: "error",
          message: err.message || "Gagal menyimpan item.",
        });
        throw err;
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (itemId) => {
    const confirmed = await confirm({
      title: "Hapus Item",
      message: "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Hapus",
    });
    if (!confirmed) return;
    setDeletingItemId(itemId);
    try {
      await itemApi.remove(itemId);
      addToast({
        type: "success",
        message: "Item berhasil dihapus!",
      });
      fetchData(); // Reload data
    } catch (err) {
      if (err.message === "Service temporarily unavailable" || err.status === 503 || err.status === 502) {
        setIsOffline(true);
      } else {
        addToast({
          type: "error",
          message: err.message || "Gagal menghapus item.",
        });
      }
    } finally {
      setDeletingItemId(null);
    }
  };

  const formatRupiah = (num) => {
    if (num === null || num === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-8">
      {/* Service Unavailable Overlay */}
      {isOffline && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 min-h-[500px]">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-red-100 dark:border-slate-700 rounded-2xl p-8 text-center shadow-2xl transition duration-300 scale-100 transform hover:scale-[1.01]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 mb-6 animate-pulse">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              Service Unavailable
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Layanan Backend / Item Service sementara tidak dapat dihubungi. Nginx API Gateway atau kontainer service sedang tidak aktif. Silakan hubungi tim DevOps atau coba kembali.
            </p>
            <button
              onClick={() => fetchData()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-3 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white shadow-lg transition"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Hubungkan Kembali
            </button>
          </div>
        </div>
      )}

      {/* Header and Title */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            📦 Inventory Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Praktikum & Tugas Terstruktur Modul 12 — Microservices Architecture
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          disabled={loading || statsLoading}
          className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${(loading || statsLoading) ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* 4 Statistics Cards (Tugas Terstruktur) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Items */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 dark:from-indigo-950/20 dark:to-blue-950/10 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Total Jenis Item
            </span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {statsLoading ? "..." : stats.total_items}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Item terdaftar milik Anda
            </p>
          </div>
        </div>

        {/* Total Value */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Nilai Inventory
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
              {statsLoading ? "..." : formatRupiah(stats.total_value)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sum (Harga x Stok)
            </p>
          </div>
        </div>

        {/* Highest Price */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/10 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Item Termahal
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
              {statsLoading ? "..." : formatRupiah(stats.highest_price)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Harga satuan tertinggi
            </p>
          </div>
        </div>

        {/* Lowest Price */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-rose-500/10 to-pink-500/5 dark:from-rose-950/20 dark:to-pink-950/10 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Item Termurah
            </span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
              {statsLoading ? "..." : formatRupiah(stats.lowest_price)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Harga satuan terendah
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form (Left/Top) & List (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Add/Edit Form */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-855 p-1">
            <ItemForm
              onSubmit={handleFormSubmit}
              editingItem={editingItem}
              onCancelEdit={() => setEditingItem(null)}
              loading={submitting}
            />
          </div>
        </div>

        {/* Right column: Search + List */}
        <div className="lg:col-span-8">
          <div className="mb-4">
            <label className="sr-only">Cari Item</label>
            <input
              type="text"
              placeholder="🔍 Cari item berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-855 p-6 min-h-[300px]">
            <ItemList
              items={items}
              onEdit={(item) => setEditingItem(item)}
              onDelete={handleDelete}
              loading={loading}
              deletingItemId={deletingItemId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
