"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { refreshApi } from "@/lib/axios";

interface AuthProviderProps {
  children: ReactNode;
}

const USER_CACHE_KEY = "cached_user";

// Helper để check localStorage an toàn (SSR-safe)
const getStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

const removeStorageItem = (key: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCachedUser, setHasCachedUser] = useState(false);
  const { setAccessToken, setUser, user } = useAuthStore();

  // Check for cached user on mount (client-side only)
  useEffect(() => {
    const cached = getStorageItem(USER_CACHE_KEY);
    if (cached) {
      setHasCachedUser(true);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      // Kiểm tra có cached user không (dấu hiệu user đã login trước đó)
      const cachedUser = getStorageItem(USER_CACHE_KEY);
      
      if (!cachedUser) {
        // Chưa từng login → không cần gọi refresh
        setIsInitialized(true);
        return;
      }

      // Có cached user → restore ngay để UI hiển thị
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
      } catch {
        removeStorageItem(USER_CACHE_KEY);
      }

      // Gọi refresh để lấy accessToken mới (cookie tự gửi)
      try {
        const { data } = await refreshApi.post("/auth/refresh");

        if (data.accessToken) {
          setAccessToken(data.accessToken);

          // Cập nhật user mới nhất từ server (background)
          const userRes = await refreshApi.get("/user/authMe", {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });

          const freshUser = userRes.data.data;
          setUser(freshUser);
          setStorageItem(USER_CACHE_KEY, JSON.stringify(freshUser));
        }
      } catch {
        // Refresh thất bại → session hết hạn, clear cache
        removeStorageItem(USER_CACHE_KEY);
        useAuthStore.getState().clearState();
      }

      setIsInitialized(true);
    };

    initAuth();
  }, [setAccessToken, setUser]);

  // Sync user to cache khi thay đổi
  useEffect(() => {
    if (user) {
      setStorageItem(USER_CACHE_KEY, JSON.stringify(user));
    }
  }, [user]);

  // Hiển thị loading chỉ khi có cached user (đang khôi phục session)
  if (!isInitialized && hasCachedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-900 dark:border-neutral-600 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

