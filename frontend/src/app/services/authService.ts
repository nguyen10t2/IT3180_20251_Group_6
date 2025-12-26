import api from "../lib/axios";
import type { SignUpFormValues } from "../lib/validations/auth";

export const authService = {
  signUp: async (data: SignUpFormValues) => {
    const payload = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      role: data.role,
      resident_id: data.resident_id ?? null,
    };

    const res = await api.post("/api/auth/register", payload, {
      withCredentials: true,
    });
    return res.data;
  },

  signIn: async (email: string, password: string) => {
    const res = await api.post(
      "/api/auth/login",
      { email, password },
      { withCredentials: true }
    );

    return {
      accessToken: res.data.access_token,
    };
  },

  signOut: async () => {
    return api.post("/api/auth/logout", {}, { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get("/api/users/me", { withCredentials: true });
    return res.data;
  },

  refreshTokenHandler: async () => {
    const res = await api.post(
      "/api/auth/refresh",
      {},
      { withCredentials: true }
    );
    return res.data.access_token;
  },

  forgetPassword: async (email: string) => {
    const res = await api.post(
      "/api/auth/forget-password",
      { email },
      { withCredentials: true }
    );
    return res.data;
  },

  verifyOtpForReset: async (email: string, otp: string) => {
    const res = await api.post(
      "/api/auth/verify-otp",
      { email, otp },
      { withCredentials: true }
    );
    return res.data;
  },

  resetPassword: async (email: string, new_password: string) => {
    const res = await api.post(
      "/api/auth/reset-password",
      { email, new_password },
      { withCredentials: true }
    );
    return res.data;
  },
};
