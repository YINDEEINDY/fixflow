import { Router, Response } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { AuthRequest } from '../types/index.js';
import * as sseService from '../services/sse.service.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// SSE endpoint - clients connect here for real-time updates
router.get('/events', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const clientId = uuidv4();
  sseService.addClient(clientId, userId, role, res);

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000); // Every 30 seconds

  // Cleanup on disconnect
  res.on('close', () => {
    clearInterval(heartbeat);
    sseService.removeClient(clientId);
  });
});

// Get SSE stats (admin only)
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    connectedClients: sseService.getClientCount(),
    connectedUsers: sseService.getConnectedUserIds(),
  });
});

export default router;
