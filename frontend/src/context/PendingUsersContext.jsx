import { createContext, useState, useCallback, useRef, useEffect } from "react";
import { adminApi } from "../services/api";

export const PendingUsersContext = createContext();

export function PendingUsersProvider({ children }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingIntervalRef = useRef(null);

  // Fetch pending users from API
  const fetchPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.get("/admin/pending-users");
      const data = response.data || response;
      const users = data.items || data || [];
      
      // Calculate unread count (users not yet approved)
      const unread = users.filter(u => u.status === "PENDING").length;
      setUnreadCount(unread);
      setPendingUsers(users);
      
      return users;
    } catch (err) {
      console.error("Failed to fetch pending users:", err);
      setError(err.message || "Failed to fetch pending users");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve a pending user with department assignment
  const approvePendingUser = useCallback(
    async (userId, departmentId) => {
      try {
        setError(null);
        
        // Send department_id as integer (FK to departments table)
        const response = await adminApi.post(`/admin/approve-user/${userId}`, {
          department_id: departmentId,
        });
        
        // Update local state - mark user as approved
        setPendingUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, status: "ACTIVE", reviewed_at: new Date().toISOString() }
              : user
          )
        );

        // Recalculate unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
        
        return response;
      } catch (err) {
        const message = err.message || "Failed to approve user";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Reject a pending user
  const rejectPendingUser = useCallback(async (userId, reason = "") => {
    try {
      setError(null);
      
      const response = await adminApi.post(`/admin/reject-user/${userId}`, {
        notes: reason,
      });
      
      // Remove from pending users list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      
      // Recalculate unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      return response;
    } catch (err) {
      const message = err.message || "Failed to reject user";
      setError(message);
      throw err;
    }
  }, []);

  // Mark pending users as reviewed (read) - optional UI tracking
  const markAsReviewed = useCallback(async () => {
    // Just clear unread count on frontend when admin opens the page
    // This is purely for UX - no backend call needed
    setUnreadCount(0);
  }, []);

  // Setup polling for real-time updates
  const setupPolling = useCallback(
    (interval = 10000) => {
      // Initial fetch
      fetchPendingUsers();

      // Setup interval
      pollingIntervalRef.current = setInterval(() => {
        fetchPendingUsers();
      }, interval);
    },
    [fetchPendingUsers]
  );

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const value = {
    pendingUsers,
    loading,
    error,
    unreadCount,
    fetchPendingUsers,
    approvePendingUser,
    rejectPendingUser,
    markAsReviewed,
    setupPolling,
    stopPolling,
  };

  return (
    <PendingUsersContext.Provider value={value}>
      {children}
    </PendingUsersContext.Provider>
  );
}
