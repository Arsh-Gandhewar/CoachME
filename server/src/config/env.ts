import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// In production, critical env vars must be set — no insecure fallbacks
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value) return value;
  if (isProduction) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  if (fallback !== undefined) return fallback;
  return '';
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: requireEnv('MONGO_URI', 'mongodb://localhost:27017/trainersapp'),
  JWT_SECRET: requireEnv('JWT_SECRET', 'dev_secret_DO_NOT_USE_IN_PROD'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_DO_NOT_USE_IN_PROD'),
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  RAZORPAY_KEY_ID: requireEnv('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: requireEnv('RAZORPAY_KEY_SECRET'),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RAZORPAY_TRAINER_PLAN_ID: process.env.RAZORPAY_TRAINER_PLAN_ID || '',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
};
