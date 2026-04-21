import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
  } = useNotifications(true, 5000);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        title="Notifikasi"
      >
        <Bell className="w-6 h-6" />

        {/* Badge untuk unread count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-red-500">
                  ({unreadCount} baru)
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Tandai semua sebagai dibaca"
                >
                  Tandai Dibaca
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 dark:text-red-400 text-sm">
                Error: {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-500 dark:text-gray-400">
                Tidak ada notifikasi
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => handleNotificationClick(notification)}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Muat Lebih Banyak"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
