import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const notificationTypeConfig = {
  ticket_created: {
    label: "Ticket Dibuat",
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    icon: "📋",
  },
  ticket_updated: {
    label: "Ticket Diperbarui",
    color: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    icon: "✏️",
  },
  ticket_assigned: {
    label: "Ticket Ditugaskan",
    color: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    icon: "👤",
  },
  ticket_resolved: {
    label: "Ticket Diselesaikan",
    color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    icon: "✓",
  },
  ticket_closed: {
    label: "Ticket Ditutup",
    color: "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400",
    icon: "⊘",
  },
  approval_requested: {
    label: "Persetujuan Diperlukan",
    color: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    icon: "ⓘ",
  },
  user_approved: {
    label: "Pengguna Disetujui",
    color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    icon: "✓",
  },
  user_rejected: {
    label: "Pengguna Ditolak",
    color: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    icon: "✕",
  },
};

export default function NotificationItem({ notification, onRead, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = notificationTypeConfig[notification.type] || notificationTypeConfig.ticket_created;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const handleNotificationClick = () => {
    onRead?.();

    if (notification.reference_id) {
      if (user?.role === "admin" || user?.role === "superadmin") {
        navigate("/admin");
      } else {
        navigate(`/employee/tickets/${notification.reference_id}`);
      }
    } else {
      if (user?.role === "admin" || user?.role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    }

    onClose?.();
  };

  return (
    <div
      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-200 dark:border-gray-700 ${
        !notification.is_read ? "bg-blue-50 dark:bg-blue-900/10" : ""
      }`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-lg flex-shrink-0 font-bold`}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formatTime(notification.created_at)}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded font-medium ${config.color}`}>
              {config.label}
            </span>
            {!notification.is_read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
        </div>
      </div>
    </div>
  );
}