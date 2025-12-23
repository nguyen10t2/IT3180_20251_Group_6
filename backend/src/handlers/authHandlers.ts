import { Elysia, t } from "elysia"
import { createRefreshToken, loginService } from "../services/authServices";
import { ErrorStatus, HttpError } from "../constants/errorContant";
import { LoginBody } from "../types/authTypes";
import { ACCESSTOKEN_TTL, REFRESHTOKEN_TTL_NUMBER, REFRESHTOKEN_TTL_STRING } from "../constants/timeContants";
import { getToken } from "../helpers/tokenHelpers";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/login", async ({ body, cookie }) => {
    const { email, password } = body;
    const res = await loginService(email, password);
    if (res.error) throw new HttpError(ErrorStatus[res.error], res.error);

    const user = res.data!;
    const accessToken = await getToken(user, ACCESSTOKEN_TTL);
    const refreshToken = await getToken({ id: user.id }, REFRESHTOKEN_TTL_STRING);

    const save = await createRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + REFRESHTOKEN_TTL_NUMBER)
    );

    if (save.error) throw new HttpError(ErrorStatus[save.error], save.error);

    cookie.refreshToken.set({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESHTOKEN_TTL_NUMBER - 1000,
      value: refreshToken,
    });

    return { accessToken };
  }, {
    body: LoginBody,
    cookie: t.Object({
      refreshToken: t.Optional(t.String()),
    }),
  })