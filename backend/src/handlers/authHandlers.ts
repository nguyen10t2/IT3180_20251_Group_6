import { Elysia, status, t } from "elysia"
import { createRefreshToken, loginService } from "../services/authServices";
import { BAD_REQUEST, CONFLICT, ErrorStatus, FORBIDDEN, HttpError, httpErrorStatus, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS } from "../constants/errorContant";
import { LoginBody, OtpBody, ResetPasswordBody } from "../types/authTypes";
import { ACCESSTOKEN_TTL, REFRESHTOKEN_TTL_NUMBER } from "../constants/timeContants";
import { getToken } from "../helpers/tokenHelpers";
import { generateRandomString, hashedPassword, verifyPassword } from "../helpers/password";
import { createUser, getUserById, isExistingUserByEmail, updateUserPassword, updateUserPasswordByEmail } from "../services/userServices";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { deleteRefreshTokensByUserId } from "../services/authServices";
import { RegisterBody } from "../types/authTypes";
import { EmailHelper } from "../helpers/emailHelpers";
import { canResendOtp, deleteOtpFromRedis, generateOtp, getOtpFromRedis, OTP_TTL, OTPData, saveOtpToRedis } from "../helpers/otpHelpers";
import client from "../helpers/redisHelpers";
import * as jose from "jose";
import { deletePendingUser, getPendingUser } from "../helpers/pendingUserHelpers";
import { verifiRefreshTokenPlugins } from "../plugins/verifiRefreshTokenPlugins";

const refreshTokenRoute = new Elysia()
  .use(verifiRefreshTokenPlugins)
  .post("/refresh", async ({ userId }) => {
    try {
      const user = await getUserById(userId);
      if (!user) {
        throw new HttpError(ErrorStatus[NOT_FOUND], "Người dùng không tồn tại");
      }

      const rest = { id: user.data.id, email: user.data.email, role: user.data.role };

      const accessToken = await getToken(rest, ACCESSTOKEN_TTL);

      return status(200, { accessToken });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })

export const authRoutes = new Elysia({ prefix: "/auth", detail: { tags: ['Auth'] } })
  .post("/login", async ({ body, cookie }) => {
    try {
      const { email, password } = body;

      const { data } = await loginService(email);
      if (!data ||
        !(await verifyPassword(password, data.hashed_password))
      ) throw new HttpError(ErrorStatus[NOT_FOUND], "Thông tin đăng nhập không chính xác");

      const { hashed_password, ...rest } = data;
      const accessToken = await getToken(rest, ACCESSTOKEN_TTL);
      const refreshToken = await generateRandomString(64);

      await createRefreshToken(
        data.id,
        refreshToken,
        new Date(Date.now() + REFRESHTOKEN_TTL_NUMBER * 1000)
      );

      const isProduction = Bun.env.NODE_ENV === "production";
      cookie.refreshToken.set({
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: REFRESHTOKEN_TTL_NUMBER,
        value: refreshToken,
      });

      return { accessToken };
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: LoginBody,
  })
  .post("/register", async ({ body, status }) => {
    try {
      const { email, password, name } = body;

      const exist = await isExistingUserByEmail(email);
      if (exist.data) {
       throw new HttpError(ErrorStatus[CONFLICT], 'Email đã tồn tại, vui lòng nhập lại !');
      }

      const hashPass = await hashedPassword(password);

      const optRes = generateOtp();
      await saveOtpToRedis(email, optRes);
      (async () => {
        try {
          const key = `userPending:${email}`;
          const value = { email, name, password: hashPass };
          await Promise.all([
            new EmailHelper().sendOtpEmail(email, optRes.code),
            client.set(key, JSON.stringify(value), 'EX', OTP_TTL + 30)
          ]);
        } catch (error) {
          if (error instanceof HttpError) throw error;
          console.error("Lỗi khi gửi OTP", error);
        }
      })();
      return status(201, { message: 'Gửi đăng kí thành công, vui lòng check email' });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: RegisterBody,
  })
  .post("/register/accept", async ({ body, status }) => {
    try {
      const { email, code } = body;
      const otpData: OTPData | null = await getOtpFromRedis(email);
      if (!otpData) {
        throw new HttpError(ErrorStatus[BAD_REQUEST], 'OTP không hợp lệ hoặc đã hết hạn');
      }

      if (otpData.code !== code) {
        throw new HttpError(ErrorStatus[BAD_REQUEST], 'OTP không đúng, vui lòng thử lại');
      }
      
      const pendingUserData = await getPendingUser(email);
      if (!pendingUserData) {
        throw new HttpError(ErrorStatus[BAD_REQUEST], 'Dữ liệu người dùng tạm thời không tồn tại hoặc đã hết hạn');
      }

      await createUser(pendingUserData.email, pendingUserData.password, pendingUserData.name);
      await Promise.all([
        deleteOtpFromRedis(email),
        deletePendingUser(email)
      ]);

      return status(201, { message: 'Xác thực thành công, bạn có thể đăng nhập ngay bây giờ !' });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: OtpBody,
  })
  .post("/resend-otp", async ({ body, status }) => {
    try {
      const { email } = body;
      const canResend = await canResendOtp(email);
      if (!canResend) {
        throw new HttpError(ErrorStatus[TOO_MANY_REQUESTS], 'Bạn đã vượt quá số lần gửi lại OTP. Vui lòng thử lại sau.');
      }
      
      const otpData = generateOtp();
      await saveOtpToRedis(email, otpData);
      (async () => {
        try {
          await new EmailHelper().sendOtpEmail(email, otpData.code);
        } catch (error) {
          console.error("Lỗi khi gửi lại OTP", error);
        }
      })();

      return status(200, { message: 'OTP đã được gửi lại thành công' });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
    })
  })
  .post("/forgot-password", async ({ body, status }) => {
    try {
      const { email } = body;
      const optRes = generateOtp();
      await saveOtpToRedis(email, optRes);

      (async () => {
        try {
          await new EmailHelper().sendOtpEmail(email, optRes.code);
        } catch (error) {
          if (error instanceof HttpError) throw error;
          console.error("Lỗi khi gửi OTP", error);
        }
      })();

      return status(200, { message: 'OTP đặt lại mật khẩu đã được gửi đến email của bạn' });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
    })
  })
  .post("/forgot-password/accept", async ({ body, status }) => {
    try {
      const { email, code } = body;
      const otpData: OTPData | null = await getOtpFromRedis(email);
      if (!otpData) {
        throw new HttpError(ErrorStatus[BAD_REQUEST], 'OTP không hợp lệ hoặc đã hết hạn');
      }

      if (otpData.code !== code) {
        throw new HttpError(ErrorStatus[BAD_REQUEST], 'OTP không đúng, vui lòng thử lại');
      }

      await deleteOtpFromRedis(email);

      (async () => {
        try {
          const key = `resetPasswordVerified:${email}`;
          const token = await getToken({ email }, "3m");
          await client.set(key, token, 'EX', 3 * 60);
        } catch (error) {
          if (error instanceof HttpError) throw error;
          console.error("Lỗi khi đặt cờ xác thực đặt lại mật khẩu", error);
        }
      })();

      return status(200, { message: 'Xác thực OTP thành công, bạn có thể đặt lại mật khẩu ngay bây giờ !' });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: OtpBody,
  })
  .post("/reset-password", async ({ body, status }) => {
    try {
      const { email, new_password } = body;
      const hashPass = await hashedPassword(new_password);
      const key = `resetPasswordVerified:${email}`;
      const token = await client.get(key);
      if (!token) {
        throw new HttpError(ErrorStatus[FORBIDDEN], 'Yêu cầu đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại quy trình quên mật khẩu.');
      }

      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(Bun.env.JWT_SECRET)
      );

      if (payload.email !== email) {
        throw new HttpError(ErrorStatus[FORBIDDEN], 'Yêu cầu đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại quy trình quên mật khẩu.');
      }
      
      await updateUserPasswordByEmail(email, hashPass);
      await client.del(key);

      return status(200, { message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: ResetPasswordBody,
  })
  .use(refreshTokenRoute)
  .use(authenticationPlugins)
  .post('/logout', async ({ cookie, user, status }) => {
    try {
      const isProduction = Bun.env.NODE_ENV === "production";
      cookie.refreshToken.set({
        value: '',
        maxAge: 0,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })

      const userId = user.id!;
      const res = await deleteRefreshTokensByUserId(userId);
      return status(200, { message: 'Logout thành công' })
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })