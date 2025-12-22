import { OTP_TTL_NUMBER_MS } from "../constants/timeContants";

export const OtpHelper = {
  generateOtp() {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
  },

  async createOtp() {
    const plainOtp = this.generateOtp();
    const otpHash = Bun.password.hash(plainOtp);
    const expiresAt = Date.now() + OTP_TTL_NUMBER_MS;
    return {
      plainOtp,
      otpHash,
      expiresAt
    };
  }
}