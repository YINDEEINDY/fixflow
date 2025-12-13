import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as dashboardService from '../services/dashboard.service.js';

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let stats;
    switch (role) {
      case 'admin':
        stats = await dashboardService.getAdminStats();
        break;
      case 'technician':
        stats = await dashboardService.getTechnicianStats(userId);
        break;
      default:
        stats = await dashboardService.getUserStats(userId);
    }

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get stats' },
    });
  }
}

export async function getRecentRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const limit = parseInt(req.query.limit as string, 10) || 5;

    const requests = await dashboardService.getRecentRequests(userId, role, limit);
    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get recent requests error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get recent requests' },
    });
  }
}
