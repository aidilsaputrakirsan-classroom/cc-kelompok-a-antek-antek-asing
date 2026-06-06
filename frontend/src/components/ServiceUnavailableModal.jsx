import { useState } from "react";
import { useServiceStatus } from "../context/ServiceStatusContext";
import { ServerCrash, RotateCw, AlertCircle } from "lucide-react";
import Button from "./ui/Button";

export default function ServiceUnavailableModal() {
  const { isModalOpen, handleRetry, handleCancel } = useServiceStatus();
  const [retrying, setRetrying] = useState(false);

  if (!isModalOpen) return null;

  const onRetry = async () => {
    setRetrying(true);
    try {
      await handleRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-6 md:p-8 flex flex-col items-center transition-all duration-300">
        
        {/* Warning Icon Container */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
          <ServerCrash className={`h-10 w-10 ${retrying ? "animate-pulse" : ""}`} />
          <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center tracking-tight mb-2">
          Server Terputus / Tidak Tersedia
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-8">
          Maaf, sistem mengalami kendala koneksi atau server sedang dalam pemeliharaan berkala (Error 503). Silakan coba lagi beberapa saat lagi.
        </p>

        {/* Action Buttons */}
        <div className="flex w-full flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={retrying}
            className="flex-1 rounded-xl py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
          >
            Batal
          </Button>
          
          <Button
            onClick={onRetry}
            disabled={retrying}
            className="flex-1 rounded-xl py-3 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
          >
            {retrying ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                Menghubungkan...
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                Coba Lagi
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
