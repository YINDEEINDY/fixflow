import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'UNAUTHORIZED', 'No token provided', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch {
    sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'FORBIDDEN', 'Insufficient permissions', 403);
      return;
    }

    next();
  };
}
