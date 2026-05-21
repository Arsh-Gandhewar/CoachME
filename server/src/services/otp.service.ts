// In-memory OTP store (replace with Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const otpService = {
  generate(email: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
    console.log(`📧 [MOCK OTP] OTP for ${email}: ${otp}`);
    return otp;
  },

  verify(email: string, otp: string): boolean {
    const entry = otpStore.get(email);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      return false;
    }
    if (entry.otp !== otp) return false;
    otpStore.delete(email);
    return true;
  },

  cleanup() {
    const now = Date.now();
    for (const [key, value] of otpStore.entries()) {
      if (now > value.expiresAt) otpStore.delete(key);
    }
  },
};

// Auto-cleanup every 10 minutes
setInterval(() => otpService.cleanup(), 10 * 60 * 1000);
