import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    sendError(res, 'DATABASE_ERROR', 'Database operation failed', 500);
    return;
  }

  sendError(
    res,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500
  );
}

export function notFound(_req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', 'Resource not found', 404);
}
