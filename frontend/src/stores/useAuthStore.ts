"use client";

import { create } from "zustand";
import { toast } from "sonner";
<<<<<<< HEAD
import { authService } from "@/services/authService";
import type { AuthState, User } from "@/types/store";
import { error } from "console";

const errorHelpers = (error: unknown, message: string) => {
  const axiosError = error as { response?: { data?: { message?: string } } };
  const errorMessage = axiosError.response?.data?.message || message;
  toast.error(errorMessage);
}
=======
import { authService } from "../services/authService";
import type { AuthState } from "../types/store";
>>>>>>> 20c976e (relocate stores to run web)

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

<<<<<<< HEAD
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
=======
  clearState: () => {
    console.log("clearState called - removing all auth data");
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      // localStorage.removeItem("auth-storage"); // No longer creating this
>>>>>>> 20c976e (relocate stores to run web)
    }
    set({
      accessToken: null,
      user: null,
      loading: false,
    });
  },

<<<<<<< HEAD
  signUp: async (name, email, password) => {
    try {
      set({ loading: true });
      await authService.signUp({ name, email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("signupEmail", email);
=======
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
>>>>>>> 20c976e (relocate stores to run web)
      }
      toast.success("Gửi mã OTP thành công! Vui lòng kiểm tra email.");
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      // Lấy message lỗi từ backend nếu có
      errorHelpers(error, "Đăng ký không thành công!");
=======
      toast.error("Đăng ký không thành công!");
>>>>>>> 20c976e (relocate stores to run web)
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { accessToken } = await authService.signIn(email, password);
<<<<<<< HEAD
      
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
=======

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
>>>>>>> 20c976e (relocate stores to run web)
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      const { accessToken } = get();
<<<<<<< HEAD
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
=======
      if (!accessToken) throw new Error("Không có access token!");

      await authService.signOut();
      get().clearState();

      toast.success("Đăng xuất thành công 🎉🎉");
    } catch (err) {
      console.error(err);
      get().clearState();
      toast.error("Lỗi khi logout, vui lòng thử lại");
>>>>>>> 20c976e (relocate stores to run web)
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
<<<<<<< HEAD
    } catch (error) {
      console.error(error);
      errorHelpers(error, "Lấy thông tin người dùng không thành công!");
      get().clearState();
      return null;
=======
    } catch (err) {
      console.error("Lỗi khi lấy thông tin người dùng:", err);
      set({ user: null });
      toast.error("Lỗi khi lấy thông tin người dùng");
>>>>>>> 20c976e (relocate stores to run web)
    } finally {
      set({ loading: false });
    }
  },
<<<<<<< HEAD
}));
=======

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
>>>>>>> 20c976e (relocate stores to run web)
