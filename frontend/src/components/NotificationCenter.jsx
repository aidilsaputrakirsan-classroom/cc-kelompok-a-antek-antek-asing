import { useRef, useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useNotification } from "../hooks/useNotification";

export default function NotificationCenter() {
  const { notifications, removeNotification, clearAll } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const unreadCount = notifications.length;

  const typeStyles = {
    success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-400",
  };

  const typeBadges = {
    success: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400",
    error: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400",
    warning: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400",
    info: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400",
  };

  const typeIcons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-20 w-96 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
                  title="Clear all notifications"
                >
                  <Trash2 size={14} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <Bell size={32} className="mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 border-l-4 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      notification.type === "success"
                        ? "border-l-emerald-500"
                        : notification.type === "error"
                        ? "border-l-red-500"
                        : notification.type === "warning"
                        ? "border-l-amber-500"
                        : "border-l-blue-500"
                    }`}
                  >
                    <div className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${typeBadges[notification.type]}`}>
                      {typeIcons[notification.type]}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNotification(notification.id)}
                      className="ml-2 mt-0.5 flex-shrink-0 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      aria-label="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
