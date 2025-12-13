import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  res.status(status).json(response);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: unknown
): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  res.status(status).json(response);
}

export function sendMessage(res: Response, message: string, status = 200): void {
  const response: ApiResponse = {
    success: true,
    message,
  };
  res.status(status).json(response);
}
