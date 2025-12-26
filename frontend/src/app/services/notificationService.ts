import axiosInstance from "@/lib/axios";

export interface Notification {
  notification_id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "urgent";
  target: "all" | "household" | "individual";
  is_pinned: boolean;
  published_at: string;
  expires_at: string | null;
  read: boolean;
  created_at: string;
}

export const notificationService = {
  // Lấy danh sách thông báo
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await axiosInstance.get("/api/notifications");
    return response.data;
  },

  // Đánh dấu đã đọc
  async markAsRead(notification_id: string): Promise<{ message: string }> {
    const response = await axiosInstance.put(`/api/notifications/${notification_id}/read`);
    return response.data;
  },

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await axiosInstance.put("/api/notifications/read-all");
    return response.data;
  },
};
