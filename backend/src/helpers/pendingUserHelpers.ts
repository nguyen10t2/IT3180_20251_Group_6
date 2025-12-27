import { OTP_TTL } from "./otpHelpers";
import client from "./redisHelpers";

const PENDING_USER_TTL = OTP_TTL + 30;

export interface PendingUser {
  email: string;
  name: string;
  password: string;
}

export const savePendingUser = async (email: string, pendingUser: PendingUser) => {
  const key = `userPending:${email}`;
  await client.set(key, JSON.stringify(pendingUser), 'EX', PENDING_USER_TTL);
};

export const getPendingUser = async (email: string): Promise<PendingUser | null> => {
    const key = `userPending:${email}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) as PendingUser : null;
};

export const deletePendingUser = async (email: string) => {
  const key = `userPending:${email}`;
  await client.del(key);
};