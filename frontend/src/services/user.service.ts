import { apiClient } from '@/lib/api-client';
import type {
  User,
  UserWithResident,
  UpdateUserRequest,
  PendingUserRequest,
  ApiResponse,
} from '@/types';

export const userService = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/users/me');
    return response.data.user;
  },

  // Update current user
  updateCurrentUser: async (data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<{ user: User }>('/users/me', data);
    return response.data.user;
  },

  // Get all users (manager only)
  getUsers: async (params?: PendingUserRequest): Promise<User[]> => {
    const response = await apiClient.post<{ users: any[] }>('/managers/users', params || { limit: 100 });
    // Backend returns user_id instead of id, map it
    return response.data.users.map(user => ({
      ...user,
      id: user.user_id || user.id
    }));
  },

  // Get pending users (manager only)
  getPendingUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<{ pendingUsers: any[] }>('/managers/users/pending');
    // Backend returns user_id instead of id, map it
    return response.data.pendingUsers.map(user => ({
      ...user,
      id: user.user_id || user.id
    }));
  },

  // Get user by ID (manager only)
  getUserById: async (id: string): Promise<UserWithResident> => {
    const response = await apiClient.get<{ userDetails: any }>(`/managers/users/${id}`);
    const data = response.data.userDetails;
    
    // Backend returns flat structure, need to transform to nested
    return {
      id: data.user_id || data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url || null,
      resident_id: data.resident_id,
      role: data.role,
      status: data.status,
      email_verified: data.email_verified || false,
      approved_by: data.approved_by || null,
      approved_at: data.approved_at || null,
      rejected_reason: data.rejected_reason || null,
      last_login_at: data.last_login_at || null,
      last_login_ip: data.last_login_ip || null,
      failed_login_attempts: data.failed_login_attempts || 0,
      locked_until: data.locked_until || null,
      deleted_at: data.deleted_at || null,
      created_at: data.created_at,
      updated_at: data.updated_at,
      resident: data.resident_id ? {
        id: data.resident_id,
        house_id: data.house_id || null,
        full_name: data.full_name,
        id_card: data.id_card || '',
        date_of_birth: data.date_of_birth || '',
        phone: data.phone || '',
        email: data.email || null,
        gender: data.gender || '',
        occupation: data.occupation || null,
        house_role: data.house_role || '',
        residence_status: data.residence_status || '',
        move_in_date: null,
        move_out_date: null,
        move_out_reason: null,
        deleted_at: null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } : undefined,
    };
  },

  // Approve user (manager only)
  approveUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/managers/users/${id}/approve`);
    return response.data;
  },

  // Reject user (manager only)
  rejectUser: async (id: string, reason: string): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/managers/users/${id}/reject`, {
      reject_reason: reason,
    });
    return response.data;
  },

  // Delete user (manager only)
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/managers/users/${id}`);
    return response.data;
  },
};
