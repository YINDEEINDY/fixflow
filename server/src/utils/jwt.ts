import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtPayload } from '../types/index.js';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function getRefreshTokenExpiry(): Date {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
