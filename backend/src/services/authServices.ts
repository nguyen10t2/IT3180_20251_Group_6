import { db } from '../database/db';
import { and, desc, eq, lt, isNull } from 'drizzle-orm';
import { userSchema } from '../models/userSchema';
import { refreshTokenSchema } from '../models/authSchema';
import client from '../helpers/redisHelpers';
import { userRoleSchema } from '../models/userSchema';

// Redis client cho OTP
const redis = client;

// ============================================
// LOGIN SERVICE
// ============================================

export const loginService = async (email: string) => {
  const rows = await db.select({
    id: userSchema.id,
    role: userRoleSchema.name,
    hashed_password: userSchema.hashed_password
  })
    .from(userSchema)
    .leftJoin(userRoleSchema, eq(userSchema.role, userRoleSchema.id))
    .where(and(
      eq(userSchema.email, email),
      isNull(userSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// ============================================
// REFRESH TOKEN SERVICES
// ============================================

// Lấy refresh token theo user_id
export const getRefreshTokenByUserId = async (userId: string) => {
  const rows = await db.select()
    .from(refreshTokenSchema)
    .where(eq(refreshTokenSchema.user_id, userId))
    .orderBy(desc(refreshTokenSchema.expires_at))
    .limit(1);

  return { data: rows[0] ?? null };
};

// Lấy refresh token theo token hash
export const getRefreshTokenByHash = async (tokenHash: string) => {
  const rows = await db.select()
    .from(refreshTokenSchema)
    .where(eq(refreshTokenSchema.token_hash, tokenHash))
    .limit(1);

  return { data: rows[0] ?? null };
};

// Tạo refresh token mới
export const createRefreshToken = async (userId: string, tokenHash: string, expiresAt: Date) => {
  const [result] = await db.insert(refreshTokenSchema)
    .values({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .returning();

  return { data: result };
};

// Xóa refresh token của user
export const deleteRefreshTokensByUserId = async (userId: string) => {
  await db.delete(refreshTokenSchema)
    .where(eq(refreshTokenSchema.user_id, userId));

  return { data: 'Tokens deleted' };
};

// Xóa refresh token cụ thể
export const deleteRefreshToken = async (tokenHash: string) => {
  await db.delete(refreshTokenSchema)
    .where(eq(refreshTokenSchema.token_hash, tokenHash));

  return { data: 'Token deleted' };
};

// Cleanup expired tokens
export const cleanupExpiredTokens = async () => {
  const now = new Date();
  await db.delete(refreshTokenSchema)
    .where(lt(refreshTokenSchema.expires_at, now));

  return { data: 'Cleanup completed' };
};

// ============================================
// OTP SERVICES (Redis-based)
// ============================================

const OTP_TTL = 5 * 60; // 5 phút
const MAX_ATTEMPTS = 5;
const RESEND_WINDOW = 10 * 60; // 10 phút
const MAX_RESEND = 3;

interface OTPData {
  code: string;
  createdAt: number;
  attempts: number;
}

// Tạo OTP mới
export const createOtp = async (email: string) => {
  const resendKey = `otp_resend:${email}`;
  const otpKey = `otp:${email}`;

  // Check resend limit
  const resendCount = await redis.get(resendKey);
  if (resendCount && parseInt(resendCount) >= MAX_RESEND) {
    return {
      data: null,
      error: 'RESEND_LIMIT_EXCEEDED',
      nextResendAt: await redis.ttl(resendKey)
    };
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with TTL
  const otpData: OTPData = {
    code,
    createdAt: Date.now(),
    attempts: 0
  };

  await redis.setex(otpKey, OTP_TTL, JSON.stringify(otpData));

  // Increment resend counter
  await redis.incr(resendKey);
  await redis.expire(resendKey, RESEND_WINDOW);

  return { data: { code, expiresIn: OTP_TTL } };
};

// Xác thực OTP
export const verifyOtp = async (email: string, code: string) => {
  const otpKey = `otp:${email}`;

  const otpDataStr = await redis.get(otpKey);
  if (!otpDataStr) {
    return { data: null, error: 'OTP_EXPIRED' };
  }

  const otpData: OTPData = JSON.parse(otpDataStr);

  // Check attempts
  if (otpData.attempts >= MAX_ATTEMPTS) {
    await redis.del(otpKey);
    return { data: null, error: 'MAX_ATTEMPTS_EXCEEDED' };
  }

  // Verify code
  if (otpData.code !== code) {
    otpData.attempts++;
    await redis.setex(otpKey, OTP_TTL, JSON.stringify(otpData));
    return {
      data: null,
      error: 'INVALID_OTP',
      remainingAttempts: MAX_ATTEMPTS - otpData.attempts
    };
  }

  // Success - delete OTP
  await redis.del(otpKey);
  await redis.del(`otp_resend:${email}`);

  return { data: { verified: true } };
};

// Lấy thông tin resend
export const getOtpResendInfo = async (email: string) => {
  const resendKey = `otp_resend:${email}`;
  const count = await redis.get(resendKey);
  const ttl = await redis.ttl(resendKey);

  return {
    data: {
      remaining: MAX_RESEND - (count ? parseInt(count) : 0),
      nextResendAt: ttl > 0 ? ttl : null
    }
  };
};

// Xóa OTP (khi không cần nữa)
export const deleteOtp = async (email: string) => {
  await redis.del(`otp:${email}`);
  await redis.del(`otp_resend:${email}`);
  return { data: 'OTP deleted' };
};

// ============================================
// RESET PASSWORD TOKEN SERVICES (Redis-based)
// ============================================

const RESET_TOKEN_TTL = 15 * 60; // 15 phút

// Tạo reset password token
export const createResetPasswordToken = async (email: string, token: string) => {
  const key = `reset_password:${email}`;

  await redis.setex(key, RESET_TOKEN_TTL, token);

  return { data: { token, expiresIn: RESET_TOKEN_TTL } };
};

// Lấy reset password token
export const getResetPasswordToken = async (email: string) => {
  const key = `reset_password:${email}`;
  const token = await redis.get(key);

  return { data: token };
};

// Xác thực reset password token
export const verifyResetPasswordToken = async (email: string, token: string) => {
  const key = `reset_password:${email}`;
  const storedToken = await redis.get(key);

  if (!storedToken) {
    return { data: null, error: 'TOKEN_EXPIRED' };
  }

  if (storedToken !== token) {
    return { data: null, error: 'INVALID_TOKEN' };
  }

  return { data: { verified: true } };
};

// Xóa reset password token (sau khi đổi mật khẩu thành công)
export const deleteResetPasswordToken = async (email: string) => {
  await redis.del(`reset_password:${email}`);
  return { data: 'Token deleted' };
};

// ============================================
// ACCOUNT LOCK SERVICES (Redis-based)
// ============================================

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60; // 15 phút

// Kiểm tra account có bị lock không
export const isAccountLocked = async (email: string) => {
  const key = `account_lock:${email}`;
  const lockUntil = await redis.get(key);

  if (!lockUntil) {
    return { data: { locked: false } };
  }

  const lockTime = parseInt(lockUntil);
  if (Date.now() > lockTime) {
    await redis.del(key);
    await redis.del(`login_attempts:${email}`);
    return { data: { locked: false } };
  }

  return {
    data: {
      locked: true,
      unlockAt: new Date(lockTime)
    }
  };
};

// Ghi nhận đăng nhập thất bại
export const recordFailedLogin = async (email: string) => {
  const attemptsKey = `login_attempts:${email}`;
  const lockKey = `account_lock:${email}`;

  const attempts = await redis.incr(attemptsKey);
  await redis.expire(attemptsKey, LOCK_DURATION);

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockUntil = Date.now() + LOCK_DURATION * 1000;
    await redis.setex(lockKey, LOCK_DURATION, lockUntil.toString());
    return {
      data: {
        locked: true,
        unlockAt: new Date(lockUntil)
      }
    };
  }

  return {
    data: {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts
    }
  };
};

// Reset login attempts (sau khi đăng nhập thành công)
export const resetLoginAttempts = async (email: string) => {
  await redis.del(`login_attempts:${email}`);
  await redis.del(`account_lock:${email}`);
  return { data: 'Reset completed' };
};