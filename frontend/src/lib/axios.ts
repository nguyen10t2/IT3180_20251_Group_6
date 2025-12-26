import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

// Main API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Refresh API instance (no interceptor to avoid loops)
const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor - Add access token to header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - Handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry auth endpoints
    const authEndpoints = [
      "/api/auth/refresh",
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/logout",
      "/api/auth/verify-otp",
      "/api/auth/resend-otp",
    ];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      console.log("Attempting to refresh token...");

      const response = await refreshApi.post(
        "/api/auth/refresh",
        {},
        { withCredentials: true }
      );

      const newToken = response.data.access_token;

      if (!newToken) {
        throw new Error("No token in refresh response");
      }

      // Update token in store
      const authStore = useAuthStore.getState();
      authStore.setAccessToken(newToken);

      // Process queue with new token
      processQueue(null, newToken);

      // Retry original request
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);

      processQueue(refreshError, null);
      useAuthStore.getState().clearState();

      // Redirect to signin (client-side)
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;