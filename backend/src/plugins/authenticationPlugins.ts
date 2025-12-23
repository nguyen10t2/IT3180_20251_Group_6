import { Elysia, NotFoundError, InternalServerError, status } from "elysia";
import * as jose from "jose";
import { PayloadJWT } from "../types/contextTypes";
import { HttpError } from "../constants/errorContant";


export const authenticationPlugins = (app: Elysia) => app
  .derive(async (ctx) => {

    const authHeader = ctx.request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HttpError(401, "Token authentication required");
    }

    const token = authHeader.split(' ')[1];

    try {
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(Bun.env.JWT_SECRET)
      );

      return { user: payload as PayloadJWT };

    } catch (error) {
      throw new HttpError(401, "Token is invalid or has expired");
    }
  });