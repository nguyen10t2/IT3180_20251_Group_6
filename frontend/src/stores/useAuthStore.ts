"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState, User } from "@/types/store";
import { error } from "console";

const errorHelpers = (error: unknown, message: string) => {
  const axiosError = error as { response?: { data?: { message?: string } } };
  const errorMessage = axiosError.response?.data?.message || message;
  toast.error(errorMessage);
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  setUser: (user: User) => {
    set({ user });
  },

  clearState: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      localStorage.removeItem("cached_user");
      // Clear cookies
      document.cookie = "userRole=; path=/; max-age=0";
      document.cookie = "isAuthenticated=; path=/; max-age=0";
    }
    set({
      accessToken: null,
      user: null,
      loading: false,
    });
  },

  signUp: async (name, email, password) => {
    try {
      set({ loading: true });
      await authService.signUp({ name, email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("signupEmail", email);
      }
      toast.success("Gửi mã OTP thành công! Vui lòng kiểm tra email.");
    } catch (error) {
      console.error(error);
      // Lấy message lỗi từ backend nếu có
      errorHelpers(error, "Đăng ký không thành công!");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { accessToken } = await authService.signIn(email, password);
      
      if (!accessToken) {
        throw new Error("Không nhận được access token");
      }
      
      get().setAccessToken(accessToken);

      const user = await get().fetchMe();
      if (!user) {
        throw new Error("Không thể lấy thông tin người dùng");
      }
      
      if (user.role && typeof window !== "undefined") {
        localStorage.setItem("userRole", user.role);
        // Set cookies for middleware
        document.cookie = `userRole=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `isAuthenticated=true; path=/; max-age=86400; SameSite=Lax`;
      }
      toast.success("Chào mừng bạn quay lại!");
    } catch (error) {
      console.error(error);
      errorHelpers(error, "Đăng nhập không thành công!");
      get().clearState();
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      const { accessToken } = get();
      if (accessToken) {
        await authService.signOut();
      }
      get().clearState();
      toast.success("Đăng xuất thành công");
    } catch (err: unknown) {
      console.error(err);
      get().clearState();
      const error = err as { response?: { status?: number } };
      if (error.response?.status !== 401) {
        toast.error("Lỗi khi logout");
      } else {
        toast.success("Đăng xuất thành công");
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
      return user;
    } catch (error) {
      console.error(error);
      errorHelpers(error, "Lấy thông tin người dùng không thành công!");
      get().clearState();
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
