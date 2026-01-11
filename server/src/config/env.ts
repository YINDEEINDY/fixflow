import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  // LINE Login
  LINE_CHANNEL_ID: z.string().optional(),
  LINE_CHANNEL_SECRET: z.string().optional(),
  LINE_CALLBACK_URL: z.string().optional(),
  // LINE Bot (Messaging API)
  LINE_BOT_CHANNEL_ACCESS_TOKEN: z.string().optional(),
  LINE_BOT_GROUP_ID: z.string().optional(),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Resend Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  // App URL for password reset links
  APP_URL: z.string().default('http://localhost:5173'),
  // Google reCAPTCHA v3
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  // Google Gemini AI
  GEMINI_API_KEY: z.string().optional(),
  // External Form API Key (for Google Form integration)
  EXTERNAL_FORM_API_KEY: z.string().optional(),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
