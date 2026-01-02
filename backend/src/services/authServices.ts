import { db } from '../database/db';
import { and, desc, eq, lt, isNull } from 'drizzle-orm';
import { userRoleSchema, userSchema } from '../models/userSchema';
import { refreshTokenSchema } from '../models/authSchema';

// ============================================
// LOGIN SERVICE
// ============================================

export const loginService = async (email: string) => {
  const rows = await db.select({
    id: userSchema.id,
    email: userSchema.email,
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