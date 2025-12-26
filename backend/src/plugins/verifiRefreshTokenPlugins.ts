import Elysia from "elysia";
import { HttpError } from "../constants/errorContant";
import { getRefreshTokenByToken } from "../services/authServices";

export const verifiRefreshTokenPlugins = (app: Elysia) => app
  .derive(async ({ cookie }) => {
    const refreshToken = cookie.refreshToken.value as string | undefined;

    if (!refreshToken) {
      throw new HttpError(401, "Refresh token is required");
    }

    const res = await getRefreshTokenByToken(refreshToken);

    if (res.error || res.data!.expires_at < new Date()) {
      throw new HttpError(401, "Invalid refresh token");
    }
    
    return { refreshTokenData: res.data! };
  });