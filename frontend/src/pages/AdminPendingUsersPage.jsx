import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { usePendingUsers } from "../hooks/usePendingUsers";
import { useNotification } from "../hooks/useNotification";
import { adminApi } from "../services/api";
import PendingUsersList from "../components/PendingUsersList";
import PendingUserApprovalModal from "../components/PendingUserApprovalModal";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AdminPendingUsersPage() {
  const {
    pendingUsers,
    loading,
    error,
    fetchPendingUsers,
    approvePendingUser,
    rejectPendingUser,
    markAsReviewed,
    setupPolling,
    stopPolling,
  } = usePendingUsers();

  const { addNotification } = useNotification();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Setup polling on mount
  useEffect(() => {
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const data = await adminApi.getDepartments();
        setDepartments(data || []);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    
    fetchDepartments();

    // Mark as reviewed when admin opens this page
    markAsReviewed();

    // Setup polling every 10 seconds for new registrations
    setupPolling(10000);

    return () => {
      stopPolling();
    };
  }, [setupPolling, stopPolling, markAsReviewed]);

  // Handle approve button click
  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setApprovalModalOpen(true);
  };

  // Handle actual approval
  const handleApproveConfirm = async (userId, department, notes) => {
    setActionLoading(true);
    try {
      await approvePendingUser(userId, department);
      addNotification(
        `User "${selectedUser.name}" approved and assigned to ${department}`,
        "success"
      );
      setApprovalModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      addNotification(
        err.message || "Failed to approve user",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = async (user) => {
    if (!window.confirm(`Reject registration for ${user.name}?`)) {
      return;
    }

    setRejectingUserId(user.id);
    try {
      await rejectPendingUser(user.id);
      addNotification(
        `User "${user.name}" registration rejected`,
        "warning"
      );
    } catch (err) {
      addNotification(
        err.response?.data?.message || "Failed to reject user",
        "error"
      );
    } finally {
      setRejectingUserId(null);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await fetchPendingUsers();
      addNotification("Refreshed pending users list", "success");
    } catch (err) {
      addNotification("Failed to refresh list", "error");
    }
  };

  const pendingCount = pendingUsers.filter((u) => u.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Pending User Registrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and approve new user registrations
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {pendingCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pendingCount === 1 ? "user pending" : "users pending"}
            </p>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <AlertCircle
            size={20}
            className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-100">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <Card>
        <PendingUsersList
          users={pendingUsers}
          loading={loading}
          onApprove={handleApproveClick}
          onReject={handleReject}
        />
      </Card>

      {/* Approval Modal */}
      <PendingUserApprovalModal
        user={selectedUser}
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedUser(null);
        }}
        onApprove={handleApproveConfirm}
        departments={departments}
        loading={actionLoading}
      />

      {/* Auto-refresh Info */}
      <div className="flex gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
        <div className="flex-1">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 Auto-refreshing every 10 seconds to check for new registrations
          </p>
        </div>
      </div>
    </div>
  );
}
