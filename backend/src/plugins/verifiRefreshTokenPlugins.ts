import Elysia from "elysia";
import { HttpError } from "../constants/errorContant";
import { getRefreshTokenByHash } from "../services/authServices";

export const verifiRefreshTokenPlugins = (app: Elysia) => app
  .derive(async ({ cookie }) => {
    try {
      const refreshToken = cookie.refreshToken.value as string | undefined;
      if (!refreshToken) {
        throw new HttpError(401, "Unauthorized: No refresh token provided");
      }

      const tokenData = await getRefreshTokenByHash(refreshToken);
      if (!tokenData.data || Date.now() > tokenData.data.expires_at.getTime()) {
        throw new HttpError(401, "Unauthorized: Invalid refresh token");
      }

      return { userId: tokenData.data.user_id };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error(error);
      throw new HttpError(500, "Internal Server Error");
    }
  });