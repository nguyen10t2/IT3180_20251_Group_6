"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "../services/authService";
import type { AuthState } from "../types/store";

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  clearState: () => {
    console.log("clearState called - removing all auth data");
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      // localStorage.removeItem("auth-storage"); // No longer creating this
    }
    set({
      accessToken: null,
      user: null,
      loading: false,
    });
  },

  signUp: async (fullname, email, password, role) => {
    try {
      set({ loading: true });
      await authService.signUp({ fullname, email, password, role });
      // Save email for OTP verification flow
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("signupEmail", email);
        } catch (e) {
          console.warn("Failed to persist signupEmail to localStorage", e);
        }
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
        localStorage.setItem("userRole", user.role);
      }

      toast.success("🎉 Chào mừng bạn quay lại!");
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
      if (!accessToken) throw new Error("Không có access token!");

      await authService.signOut();
      get().clearState();

      toast.success("Đăng xuất thành công 🎉🎉");
    } catch (err) {
      console.error(err);
      get().clearState();
      toast.error("Lỗi khi logout, vui lòng thử lại");
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
      console.error("Lỗi khi lấy thông tin người dùng:", err);
      set({ user: null });
      toast.error("Lỗi khi lấy thông tin người dùng");
    } finally {
      set({ loading: false });
    }
  },

  refreshTokenHandler: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe } = get();

      const accessToken = await authService.refreshTokenHandler();
      get().setAccessToken(accessToken);

      // Fetch user if not available
      if (!user) {
        await fetchMe();
      }
    } catch (err) {
      console.error("Lỗi khi làm mới token:", err);
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));