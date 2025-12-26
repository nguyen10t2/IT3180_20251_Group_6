import { Elysia, t } from "elysia"
import { createRefreshToken, loginService } from "../services/authServices";
import { ErrorStatus, HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { LoginBody } from "../types/authTypes";
import { ACCESSTOKEN_TTL, REFRESHTOKEN_TTL_NUMBER } from "../constants/timeContants";
import { getToken } from "../helpers/tokenHelpers";
import { generateRandomString } from "../helpers/password";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/login", async ({ body, cookie }) => {
    try {
      const { email, password } = body;

      const { data } = await loginService(email, password);
      if (!data) throw new HttpError(ErrorStatus.NOT_FOUND, "Thông tin đăng nhập không chính xác");

      const accessToken = await getToken(data, ACCESSTOKEN_TTL);
      const refreshToken = await generateRandomString(64);

      await createRefreshToken(
        data.id,
        refreshToken,
        new Date(Date.now() + REFRESHTOKEN_TTL_NUMBER)
      );

      cookie.refreshToken.set({
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: REFRESHTOKEN_TTL_NUMBER - 1000,
        value: refreshToken,
      });

      return { accessToken };
    } catch (error) {
      console.error(error);
      throw new HttpError(ErrorStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: LoginBody,
  })