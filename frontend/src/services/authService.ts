import api from "@/lib/axios";
import type { SignUpFormValues } from "@/lib/validations/auth";

export const authService = {
  signUp: async (data: SignUpFormValues) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
    };
    const res = await api.post("/auth/register", payload, {
      withCredentials: true,
    });
    return res.data;
  },

  verifyOtp: async (email: string, code: string) => {
    const res = await api.post(
      "/auth/register/accept",
      { email, code },
      { withCredentials: true }
    );
    return res.data;
  },

  resendOtp: async (email: string) => {
    const res = await api.post(
      "/auth/resend-otp",
      { email },
      { withCredentials: true }
    );
    return res.data;
  },

  signIn: async (email: string, password: string) => {
    const res = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    return { accessToken: res.data.accessToken };
  },

  signOut: async () => {
    return api.post("/auth/logout", {}, { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get("/users/authMe", { withCredentials: true });
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post(
      "/auth/forgot-password",
      { email },
      { withCredentials: true }
    );
    return res.data;
  },

  verifyOtpForReset: async (email: string, code: string) => {
    const res = await api.post(
      "/auth/forgot-password/accept",
      { email, code },
      { withCredentials: true }
    );
    return res.data;
  },

  resetPassword: async (email: string, new_password: string) => {
    const res = await api.post(
      "/auth/reset-password",
      { email, new_password },
      { withCredentials: true }
    );
    return res.data;
  },

  changePassword: async (old_password: string, new_password: string) => {
    const res = await api.post(
      "/users/changePass",
      { old_password, new_password },
      { withCredentials: true }
    );
    return res.data;
  },
};
