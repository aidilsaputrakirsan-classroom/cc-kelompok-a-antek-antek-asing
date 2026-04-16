import { useEffect } from "react";

export default function Alert({ message, type = "error", onClose, autoClose = true, duration = 4000 }) {
  useEffect(() => {
    if (!message || !autoClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div
      className={`
        animate-in fade-in slide-in-from-top-2 duration-300
        rounded-lg border px-4 py-3 text-sm font-medium transition-all
        ${
          isSuccess
            ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
            : isError
            ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
            : "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
        }
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isSuccess && (
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {isError && (
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-current opacity-70 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
