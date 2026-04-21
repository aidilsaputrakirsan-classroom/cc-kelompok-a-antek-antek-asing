import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const toastConfig = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-900/50",
    icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
    text: "text-green-800 dark:text-green-400",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-900/50",
    icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    text: "text-red-800 dark:text-red-400",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-900/50",
    icon: (
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    ),
    text: "text-amber-800 dark:text-amber-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-900/50",
    icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    text: "text-blue-800 dark:text-blue-400",
  },
};

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type] || toastConfig.info;

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border} pointer-events-auto max-w-sm animate-in fade-in slide-in-from-right-full duration-200`}
          >
            {config.icon}
            <div className="flex-1">
              <p className={`text-sm font-medium ${config.text}`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 ml-2 ${config.text} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
