import { env } from '../config/env.js';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5;

export async function verifyRecaptcha(token: string, expectedAction?: string): Promise<boolean> {
  // Skip verification if secret key is not configured
  if (!env.RECAPTCHA_SECRET_KEY) {
    return true;
  }

  // Skip if no token provided (for backward compatibility)
  if (!token) {
    return true;
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error('reCAPTCHA verification failed: HTTP error', response.status);
      return false;
    }

    const data = await response.json() as RecaptchaResponse;

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }

    // Check score for v3
    if (data.score !== undefined && data.score < MIN_SCORE) {
      console.warn('reCAPTCHA score too low:', data.score);
      return false;
    }

    // Check action if provided
    if (expectedAction && data.action !== expectedAction) {
      console.warn('reCAPTCHA action mismatch:', data.action, 'expected:', expectedAction);
      return false;
    }

    return true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}
