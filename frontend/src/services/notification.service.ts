import { apiClient } from '@/lib/api-client';
import type {
  Notification,
  NotificationWithRelations,
  CreateNotificationRequest,
  ApiResponse,
} from '@/types';

export const notificationService = {
  // Get all notifications (manager/accountant)
  getAllNotifications: async (role: 'manager' | 'accountant' = 'manager'): Promise<NotificationWithRelations[]> => {
    const endpoint = role === 'accountant' ? '/accountants/notifications' : '/managers/notifications';
    const response = await apiClient.get<{ notifications: NotificationWithRelations[] }>(endpoint);
    return response.data.notifications;
  },

  // Create notification (manager/accountant)
  createNotification: async (data: CreateNotificationRequest, role: 'manager' | 'accountant' = 'manager'): Promise<ApiResponse> => {
    const endpoint = role === 'accountant' ? '/accountants/notifications' : '/managers/notifications';
    const response = await apiClient.post<ApiResponse>(endpoint, data);
    return response.data;
  },

  // Delete notification (manager/accountant)
  deleteNotification: async (id: string, role: 'manager' | 'accountant' = 'manager'): Promise<ApiResponse> => {
    const endpoint = role === 'accountant' ? `/accountants/notifications/${id}` : `/managers/notifications/${id}`;
    const response = await apiClient.delete<ApiResponse>(endpoint);
    return response.data;
  },

  // Get resident notifications
  getResidentNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<{ notifications: Notification[] }>('/notifications');
    return response.data.notifications;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },
};
