import { Context, Elysia, t } from "elysia"
import { createRefreshToken, deleteRefreshTokenByUserId, loginService } from "../services/authServices";
import { ErrorStatus, HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { LoginBody, RegisterBody } from "../types/authTypes";
import { ACCESSTOKEN_TTL, REFRESHTOKEN_TTL_NUMBER, REFRESHTOKEN_TTL_STRING } from "../constants/timeContants";
import { getToken } from "../helpers/tokenHelpers";
import { generateRandomString, hashedPassword } from "../helpers/password";
import { createUser, isExistingUserByEmail } from "../services/userServices";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { error } from "node:console";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/login", async ({ body, cookie }) => {
    try {
      const { email, password } = body;
      const res = await loginService(email, password);
      const user = res.data!;
      const accessToken = await getToken(user, ACCESSTOKEN_TTL);

      // Create Refresh Token Randomly
      const refreshToken = await generateRandomString(64);

      const save = await createRefreshToken(
        user.id,
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
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: LoginBody,
  })
  .post("/register", async ({ body, status }) => {
    try {
      const { email, password, name } = body;

      const exist = await isExistingUserByEmail(email);
      if (exist.data) {
        return status(409, { message: 'Email đã tồn tại, vui lòng nhập lại !' });
      }

      const hashPass = await hashedPassword(password);
      const res = await createUser(email, hashPass, name);

      return status(201, { message: 'Đã tạo thành công người dùng', data: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }

  }, {
    body: RegisterBody,
  })
  .use(authenticationPlugins)
  .post('/logout', async ({ cookie, user, status }) => {
    try {
      cookie.refreshToken.set({
        value: '',
        maxAge: 0
      })

      const userId = user.id!;
      const res = await deleteRefreshTokenByUserId(userId);
      return status(200, { message: 'Logout thành công' })
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })