import { apiClient } from "./api-client";

/**
 * Service untuk mengelola notifikasi dari backend
 */
const notificationService = {
  /**
   * Ambil notifikasi dengan pagination
   * @param {number} skip - offset untuk pagination
   * @param {number} limit - jumlah item per halaman
   * @returns {Promise<{unread_count, total, items}>}
   */
  getNotifications: async (skip = 0, limit = 20) => {
    try {
      const data = await apiClient.get("/notifications", {
        params: { skip, limit },
      });
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Tandai satu notifikasi sebagai dibaca
   * @param {number} notificationId - ID notifikasi
   * @returns {Promise}
   */
  markAsRead: async (notificationId) => {
    try {
      const data = await apiClient.put(
        `/notifications/${notificationId}/read`,
        {}
      );
      return data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Tandai semua notifikasi sebagai dibaca
   * @returns {Promise}
   */
  markAllAsRead: async () => {
    try {
      const data = await apiClient.put("/notifications/read-all", {});
      return data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};

export default notificationService;
