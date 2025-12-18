// import { Elysia, status, t } from "elysia"
// import { createRefreshToken, loginService } from "../services/authServices";
// import { mapErrorStatus } from "../constants/errorContant";
// import * as jose from 'jose';
// import { PayloadJWT } from "../types/contextTypes";

// // Định nghĩa các route liên quan đến xác thực

// const getToken = async (payload?: PayloadJWT, expiry?: string) => {
//   const signJwt = new jose.SignJWT(payload).setProtectedHeader({
//     alg: "HS256",
//   });
//   if (expiry) {
//     signJwt.setExpirationTime(expiry);
//   }
//   return await signJwt.sign(new TextEncoder().encode(Bun.env.JWT_SECRET));
// };

// export const authRoutes = new Elysia({ prefix: "/auth" })
//   .post("/login", async ({ body, status, cookie }) => {
//     const { email, password } = body;
//     const res = await loginService(email, password);
//     if (res.error) return status(mapErrorStatus[res.error], { message: res.error });

//     const user = res.data!;
//     const accessToken = await getToken(user, '15m');
//     const refreshToken = await getToken({ id: user.id }, '7d');

//     const save = await createRefreshToken(
//       user.id,
//       refreshToken,
//       new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//     );

//     if (save.error) return status(500, { message: "Internal Server Error" });

//     cookie.refreshToken.set({
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60,
//       value: refreshToken,
//     });

//     return { accessToken };
//   }, {
//     body: t.Object({
//       email: t.String({ format: "email" }),
//       password: t.String(),
//     }),
//     cookie: t.Object({
//       refreshToken: t.Optional(t.String()),
//     }),
//   });