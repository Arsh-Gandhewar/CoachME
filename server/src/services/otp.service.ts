import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../utils/logger';

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const otpService = {
  async generate(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    try {
      await transporter.sendMail({
        from: `"CoachME Support" <${env.SMTP_USER}>`,
        to: email,
        subject: 'CoachME - Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
            <h2>Password Reset</h2>
            <p>You requested a password reset. Here is your verification code:</p>
            <h1 style="color: #C9B07D; letter-spacing: 2px;">${otp}</h1>
            <p>This code will expire in 5 minutes.</p>
          </div>
        `,
      });
      logger.info(`📧 Sent OTP to ${email}`);
    } catch (error) {
      logger.error(`❌ Failed to send OTP to ${email}:`, error);
      throw new Error('Could not send verification email. Please try again later.');
    }

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
