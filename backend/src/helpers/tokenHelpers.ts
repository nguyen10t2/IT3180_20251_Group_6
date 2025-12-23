import * as jose from "jose";
import { PayloadJWT } from "../types/contextTypes";

export const getToken = async (payload?: PayloadJWT, expiry?: string) => {
  const signJwt = new jose.SignJWT(payload).setProtectedHeader({
    alg: "HS256",
  });
  if (expiry) {
    signJwt.setExpirationTime(expiry);
  }
  return await signJwt.sign(new TextEncoder().encode(Bun.env.JWT_SECRET));
};