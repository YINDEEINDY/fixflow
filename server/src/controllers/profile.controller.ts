import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as profileService from '../services/profile.service.js';

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get profile' },
    });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name, phone, department, avatarUrl } = req.body;

    const profile = await profileService.updateProfile(userId, {
      name,
      phone,
      department,
      avatarUrl,
    });

    return res.json({ success: true, data: profile });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update profile' },
    });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required',
        },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New password must be at least 6 characters' },
      });
    }

    await profileService.changePassword(userId, { currentPassword, newPassword });

    return res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
      }
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
        });
      }
      if (error.message === 'NO_PASSWORD_SET') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_PASSWORD',
            message: 'No password set for this account (LINE login only)',
          },
        });
      }
    }
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to change password' },
    });
  }
}

export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const stats = await profileService.getUserStats(userId);
    return res.json({ success: true, data: stats });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    console.error('Get user stats error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get user stats' },
    });
  }
}
