import { Mail, Calendar, User } from "lucide-react";
import Button from "./ui/Button";

export default function PendingUserCard({ user, onApprove, onReject, loading }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User size={18} className="text-slate-500" />
            {user.name || user.username}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Mail size={14} />
            {user.email}
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {user.status === "ACTIVE" && (
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              Approved
            </span>
          )}
          {user.status === "PENDING" && (
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
              Pending
            </span>
          )}
          {user.status === "REJECTED" && (
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
              Rejected
            </span>
          )}
        </div>
      </div>

      {/* Registration Date */}
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <Calendar size={14} />
        Registered: {formatDate(user.created_at)}
      </div>

      {/* Additional Info */}
      {user.phone && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-medium">Phone:</span> {user.phone}
        </p>
      )}

      {/* Actions - Only show if pending */}
      {user.status === "PENDING" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={() => onApprove(user)}
            variant="primary"
            size="sm"
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            onClick={() => onReject(user)}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            Reject
          </Button>
        </div>
      )}

      {/* Message for approved/rejected users */}
      {user.status === "ACTIVE" && user.approved_at && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          ✓ Approved on {formatDate(user.approved_at)}
        </p>
      )}
      {user.status === "REJECTED" && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          ✕ Registration was rejected
        </p>
      )}
    </div>
  );
}
