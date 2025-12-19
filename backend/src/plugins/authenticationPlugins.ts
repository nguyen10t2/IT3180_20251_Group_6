// import { Elysia } from "elysia";
// import * as jose from "jose";
// import { PayloadJWT } from "../types/contextTypes";


// export const authenticationPlugins = (app: Elysia) => app
//   .derive(async (ctx) => {

//     const authHeader = ctx.request.headers.get('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       ctx.set.status = 401;
//       return { error: UNAUTHORIZED };
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//       const { payload } = await jose.jwtVerify(
//         token,
//         new TextEncoder().encode(Bun.env.JWT_SECRET)
//       );

//       return { user: payload as PayloadJWT };

//     } catch (error) {
//       ctx.set.status = 401;
//       return { error: 'Invalid token' };
//     }
//   })
//   .onBeforeHandle(({ user, status }) => {
//     if (!user) return status(401, UNAUTHORIZED);
//   });