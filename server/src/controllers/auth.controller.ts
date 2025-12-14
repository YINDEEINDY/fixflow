import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const lineLoginSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    // Set refresh token as HTTP-only cookie (7 days)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      sendError(res, 'EMAIL_EXISTS', 'Email already registered', 409);
      return;
    }

    throw error;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const rememberMe = req.body.rememberMe === true;
    const result = await authService.login(input);

    // Remember me: 30 days, otherwise 7 days
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge,
    });

    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    if (error instanceof Error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
        return;
      }
      if (error.message === 'ACCOUNT_DISABLED') {
        sendError(res, 'ACCOUNT_DISABLED', 'Account is disabled', 403);
        return;
      }
    }

    throw error;
  }
}

export async function lineLogin(req: Request, res: Response): Promise<void> {
  try {
    const { code } = lineLoginSchema.parse(req.body);

    // Exchange code for access token with LINE
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.LINE_CALLBACK_URL || '',
        client_id: env.LINE_CHANNEL_ID || '',
        client_secret: env.LINE_CHANNEL_SECRET || '',
      }),
    });

    if (!tokenResponse.ok) {
      sendError(res, 'LINE_AUTH_FAILED', 'Failed to authenticate with LINE', 401);
      return;
    }

    const tokenData = await tokenResponse.json() as { access_token: string; id_token?: string };

    // Get user profile from LINE
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      sendError(res, 'LINE_PROFILE_FAILED', 'Failed to get LINE profile', 401);
      return;
    }

    const profile = await profileResponse.json() as {
      userId: string;
      displayName: string;
      pictureUrl?: string;
    };

    const result = await authService.loginWithLine({
      lineId: profile.userId,
      name: profile.displayName,
      avatarUrl: profile.pictureUrl,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      isNewUser: result.isNewUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request', 400);
      return;
    }

    if (error instanceof Error && error.message === 'ACCOUNT_DISABLED') {
      sendError(res, 'ACCOUNT_DISABLED', 'Account is disabled', 403);
      return;
    }

    throw error;
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      sendError(res, 'INVALID_REFRESH_TOKEN', 'No refresh token provided', 401);
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN') {
      sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
      return;
    }
    throw error;
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken');
  sendSuccess(res, { message: 'Logged out successfully' });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      return;
    }

    const user = await authService.getUser(req.user.userId);
    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
      return;
    }
    throw error;
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.requestPasswordReset(email);

    // Always return success to prevent email enumeration
    sendSuccess(res, { message: 'Password reset email sent if account exists' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid email format', 400);
      return;
    }
    throw error;
  }
}

const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function verifyResetToken(req: Request, res: Response): Promise<void> {
  try {
    const { token } = verifyResetTokenSchema.parse(req.body);
    const isValid = await authService.verifyResetToken(token);
    sendSuccess(res, { valid: isValid });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, 'VALIDATION_ERROR', 'Token is required', 400);
      return;
    }
    throw error;
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(token, password);
    sendSuccess(res, { message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    if (error instanceof Error) {
      if (error.message === 'INVALID_RESET_TOKEN') {
        sendError(res, 'INVALID_RESET_TOKEN', 'Invalid reset token', 400);
        return;
      }
      if (error.message === 'EXPIRED_RESET_TOKEN') {
        sendError(res, 'EXPIRED_RESET_TOKEN', 'Reset token has expired', 400);
        return;
      }
    }

    throw error;
  }
}
