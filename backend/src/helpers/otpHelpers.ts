import client from "./redisHelpers";
export const OTP_TTL = 1 * 60;
export const MAX_ATTEMPTS = 5;
export const RESEND_WINDOW = 2 * 60;
export const MAX_RESEND = 3;

export interface OTPData {
  code: string;
  createdAt: number;
  attempts: number;
}

export const generateOtp = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = Date.now();
  const attempts = 0;
  return { code, createdAt, attempts };
}

export const saveOtpToRedis = async (email: string, otpData: OTPData) => {
  const key = `otp:${email}`;
  await client.set(key, JSON.stringify(otpData), 'EX', OTP_TTL);
};

export const getOtpFromRedis = async (email: string): Promise<OTPData | null> => {
  const key = `otp:${email}`;
  const data = await client.get(key);
  return data ? JSON.parse(data) as OTPData : null;
};

export const deleteOtpFromRedis = async (email: string) => {
  const key = `otp:${email}`;
  await client.del(key);
};

export const incrementOtpAttempts = async (email: string) => {
  const otpData = await getOtpFromRedis(email);
  if (otpData) {
    otpData.attempts += 1;
    await saveOtpToRedis(email, otpData);
  }
};

export const canResendOtp = async (email: string): Promise<boolean> => {
  const key = `otp_resend:${email}`;
  const resendCount = await client.get(key);
  if (resendCount && parseInt(resendCount) >= MAX_RESEND) {
    return false;
  }
  await client.incr(key);
  await client.expire(key, RESEND_WINDOW);
  return true;
};

