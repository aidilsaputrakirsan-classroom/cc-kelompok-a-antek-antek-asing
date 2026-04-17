import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function PendingUserBadge({ unreadCount = 0 }) {
  if (unreadCount === 0) {
    return (
      <Link
        to="/admin/pending-users"
        className="relative rounded-md px-3 py-1.5 text-sm transition text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <Bell size={18} />
      </Link>
    );
  }

  return (
    <Link
      to="/admin/pending-users"
      className="relative rounded-md px-3 py-1.5 text-sm transition bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
    >
      <div className="flex items-center gap-2">
        <Bell size={18} />
        <span className="text-xs font-semibold">{unreadCount}</span>
      </div>

      {/* Animated pulsing dot */}
      <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
    </Link>
  );
}
