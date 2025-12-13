import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  details?: string[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';

  console.error(`[Error] ${status}: ${message}`, err);

  res.status(status).json({
    error: err.name || 'Error',
    message,
    details: err.details,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'ไม่พบ endpoint นี้',
  });
};
