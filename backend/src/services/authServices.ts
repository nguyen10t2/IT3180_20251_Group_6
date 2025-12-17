import { db } from '../database/db';
import { and, desc, eq, lt, count, gte, or } from 'drizzle-orm';
import { Users } from '../models/users';
import { RefreshToken, OTP, ResetPasswordToken } from '../models/auth';

// Lấy thông tin user để đăng nhập (ko bao gồm mật khẩu)
export const loginService = async (email: string, password: string) => {
  try {
    const rows = await db.select({
      id: Users.id,
      email: Users.email,
      password: Users.password,
      role: Users.role,
    })
      .from(Users)
      .where(eq(Users.email, email));

    if (rows.length === 0) {
      return { error: "Unauthorized", status: 401 };
    }

    const user = rows[0];

    const isMatch = await Bun.password.verify(password, user.password);

    if (!isMatch) {
      return { error: "Unauthorized", status: 401 };
    }

    const { password: _, ...safeUser } = user;

    return { data: safeUser };

  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// -- Refresh Token Services --

// Lấy refresh token gần nhất của user
export const getRefreshTokenByUserId = async (userId: string) => {
  try {
    const rows = await db.select()
      .from(RefreshToken)
      .where(eq(RefreshToken.user_id, userId))
      .orderBy(desc(RefreshToken.expires_at))
      .limit(1);

    if (rows.length === 0) {
      return { error: "Refresh token not found", status: 404 };
    }

    return { data: rows[0] };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Lưu refresh token mới
export const createRefreshToken = async (userId: string, token: string, expiresAt: Date) => {
  try {
    const result = await db.insert(RefreshToken)
      .values({
        user_id: userId,
        token: token,
        expires_at: expiresAt,
      })
      .returning();

    return { data: result[0] };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Xoá refresh token của user
export const deleteRefreshTokenByUserId = async (userId: string) => {
  try {
    await db.delete(RefreshToken)
      .where(eq(RefreshToken.user_id, userId));

    return { data: 'Refresh token deleted successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Xoá các refresh token đã hết hạn
export const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();
    await db.delete(RefreshToken)
      .where(lt(RefreshToken.expires_at, now));

    return { data: 'Expired tokens cleaned up successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// -- Otp Services --

// Tạo OTP mới
export const createOtp = async (email: string, code: string, expires_at: Date) => {
  try {
    await db.insert(OTP)
      .values({
        email: email,
        code,
        expires_at: expires_at,
      });
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Lấy Otp gần nhất bằng email
export const getOtpByEmail = async (email: string) => {
  try {
    const rows = await db.select()
      .from(OTP)
      .where(
        and(
          eq(OTP.email, email),
          eq(OTP.is_used, false)
        )
      )
      .orderBy(desc(OTP.expires_at))
      .limit(1);

    if (rows.length === 0) {
      return { error: "OTP not found", status: 404 };
    }

    return { data: rows[0] };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Xóa tất cả Otp bằng email
export const deleteOtpByEmail = async (email: string) => {
  try {
    await db.delete(OTP)
      .where(eq(OTP.email, email));

    return { data: 'OTP deleted successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

export const updateOtpByEmail = async (email: string) => {
  try {
    await db.update(OTP)
      .set({
        is_used: true,
      })
      .where(
        and(
          eq(OTP.email, email),
          eq(OTP.is_used, false)
        )
      );

    return { data: 'OTP updated successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Xoá các Otp đã hết hạn
export const cleanupExpiredOtps = async () => {
  try {
    const now = new Date();
    await db.delete(OTP)
      .where(
        or(
          lt(OTP.expires_at, now),
          eq(OTP.is_used, true)
        )
      );

    return { data: 'Expired OTPs cleaned up successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Đếm số lần gửi lại OTP trong 10 phút gần nhất của email
export const resendCount = async (email: string) => {
  try {
    const now = new Date();
    const pastTenMinutes = new Date(now.getTime() - 10 * 60000);

    const [{ value }] = await db.select({ value: count() })
      .from(OTP)
      .where(and(
        eq(OTP.email, email),
        gte(OTP.created_at, pastTenMinutes)
      ));

    return { data: value };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// -- Reset Password Token Services --

// Tạo reset password token mới
export const createResetPassword = async (email: string, token: string, expiresAt: Date) => {
  try {
    const result = await db.insert(ResetPasswordToken)
      .values({
        email: email,
        token: token,
        expires_at: expiresAt,
      })
      .returning();
    return { data: result[0] };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Lấy reset password token gần nhất bằng email
export const getResetPasswordToken = async (email: string) => {
  try {
    const rows = await db.select()
      .from(ResetPasswordToken)
      .where(and(
        eq(ResetPasswordToken.email, email),
      ))
      .orderBy(desc(ResetPasswordToken.expires_at))
      .limit(1);

    if (rows.length === 0) {
      return { error: "Reset password token not found", status: 404 };
    }

    return { data: rows[0] };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

// Xoá reset password token bằng email
export const deleteResetPasswordTokenByEmail = async (email: string) => {
  try {
    const pastTenMinutes = new Date(Date.now() - 10 * 60000);
    await db.delete(ResetPasswordToken)
      .where(
        or(
          eq(ResetPasswordToken.email, email),
          lt(ResetPasswordToken.expires_at, pastTenMinutes)
        )
      );
    return { data: 'Reset password token deleted successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};