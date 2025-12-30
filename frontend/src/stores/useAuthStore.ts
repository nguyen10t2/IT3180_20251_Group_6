"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState, User } from "@/types/store";

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
      toast.error("Đăng ký không thành công!");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { accessToken } = await authService.signIn(email, password);
      get().setAccessToken(accessToken);

      const user = await get().fetchMe();
      if (user?.role && typeof window !== "undefined") {
        localStorage.setItem("userRole", String(user.role));
      }

      toast.success("Chào mừng bạn quay lại!");
    } catch (err) {
      console.error(err);
      toast.error("Đăng nhập không thành công");
      get().clearState();
      throw err;
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
      // Only show error if it's not a 401 (token expired = already logged out)
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
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
