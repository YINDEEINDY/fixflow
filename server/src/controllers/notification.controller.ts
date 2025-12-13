import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as notificationService from '../services/notification.service.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { unreadOnly } = req.query;

    const notifications = await notificationService.getNotifications(
      userId,
      unreadOnly === 'true'
    );

    return res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get notifications' },
    });
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);
    return res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get unread count' },
    });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await notificationService.markAsRead(id, userId);
    return res.json({ success: true, data: notification });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOTIFICATION_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Notification not found' },
        });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot access this notification' },
        });
      }
    }
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark as read' },
    });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);
    return res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark all as read' },
    });
  }
}
