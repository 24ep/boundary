// In-memory OTP store: key = email|phone, value = { otp, expiresAt }
export const otpStore = new Map<string, { otp: string; expiresAt: number }>();
