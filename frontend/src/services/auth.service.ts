import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OtpRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
} from '@/types';

export const authService = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/register', data);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: OtpRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/register/accept', data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/resend-otp', { email });
    return response.data;
  },

  // Request OTP for password reset
  requestPasswordResetOtp: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh');
    return response.data;
  },
};
