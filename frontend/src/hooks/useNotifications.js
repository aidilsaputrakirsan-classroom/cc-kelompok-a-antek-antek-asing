import { useState, useCallback, useEffect, useRef } from "react";
import notificationService from "../services/notification-service";

/**
 * Hook untuk mengelola notifikasi dari backend dengan polling
 * @param {boolean} autoRefresh - enable auto-refresh (default: true)
 * @param {number} pollInterval - interval polling dalam ms (default: 5000)
 * @returns {object} notifications state dan functions
 */
export function useNotifications(autoRefresh = true, pollInterval = 5000) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pollIntervalRef = useRef(null);

  // Fetch notifikasi
  const fetchNotifications = useCallback(async (offset = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(offset, 20);

      if (append) {
        setNotifications((prev) => [...prev, ...data.items]);
      } else {
        setNotifications(data.items);
      }

      setUnreadCount(data.unread_count);
      setTotal(data.total);
      setHasMore(offset + 20 < data.total);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tandai notifikasi sebagai dibaca
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // Tandai semua notifikasi sebagai dibaca
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // Load lebih banyak notifikasi (infinite scroll)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextSkip = notifications.length;
      setSkip(nextSkip);
      fetchNotifications(nextSkip, true);
    }
  }, [hasMore, loading, notifications.length, fetchNotifications]);

  // Setup auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    // Fetch initial notifications
    fetchNotifications(0, false);

    // Setup polling
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications(0, false);
    }, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [autoRefresh, pollInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    total,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh: () => fetchNotifications(0, false),
  };
}
