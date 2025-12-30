import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Main API instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Quan trọng: gửi httpOnly cookie
});

// Refresh API instance (không có interceptor để tránh loop)
const refreshApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add access token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - Handle 401 + refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Các endpoint không cần retry
    const skipRefreshEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/refresh",
      "/auth/register/accept",
      "/auth/resend-otp",
      "/auth/forgot-password",
      "/auth/forgot-password/accept",
      "/auth/reset-password",
    ];

    const shouldSkip = skipRefreshEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (shouldSkip) {
      return Promise.reject(error);
    }

    // 401 + chưa retry → thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh → queue request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh - cookie tự động gửi kèm
        const { data } = await refreshApi.post("/auth/refresh");

        // Lưu accessToken mới
        useAuthStore.getState().setAccessToken(data.accessToken);

        processQueue(null, data.accessToken);

        // Retry request với token mới
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh thất bại → logout
        useAuthStore.getState().clearState();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { refreshApi };
export default api;
