import { useServiceStatus } from "../context/ServiceStatusContext";
import { AlertTriangle } from "lucide-react";

export default function ServiceUnavailableBanner({ variant = "banner" }) {
  const { isAuthDown } = useServiceStatus();

  if (!isAuthDown) return null;

  if (variant === "card") {
    return (
      <div className="mb-6 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/40 rounded-xl p-3.5 text-sm font-semibold flex items-start gap-2.5 shadow-sm transition-all duration-300">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <span className="block font-bold">Some features temporarily unavailable</span>
          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
            Layanan autentikasi tidak responsif. Beberapa fitur mungkin tidak berfungsi dengan baik.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md shrink-0 z-50 border-b border-amber-400/20 animate-pulse">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>Some features temporarily unavailable</span>
    </div>
  );
}
