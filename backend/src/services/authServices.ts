import { db } from '../database/db';
import { eq, lt } from 'drizzle-orm';
import { Users } from '../models/users';
import { RefreshTokens } from '../models/refreshToken';

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

export const getRefreshTokenByUserId = async (userId: string) => {
  try {
    const rows = await db.select()
      .from(RefreshTokens)
      .where(eq(RefreshTokens.user_id, userId));

    if (rows.length === 0) {
      return { error: "Refresh token not found", status: 404 };
    }

    return { data: rows[0] };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

export const saveRefreshToken = async (userId: string, token: string, expiresAt: Date) => {
  try {
    const result = await db.insert(RefreshTokens)
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

export const deleteRefreshToken = async (token: string) => {
  try {
    await db.delete(RefreshTokens)
      .where(eq(RefreshTokens.token, token));

    return { data: 'Refresh token deleted successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};

export const cleanupExpiredTokens = async () => {
    try {
    const now = new Date();
    await db.delete(RefreshTokens)
      .where(lt(RefreshTokens.expires_at, now));

    return { data: 'Expired tokens cleaned up successfully' };
  } catch (_) {
    return { error: 'Internal Server Error' };
  }
};