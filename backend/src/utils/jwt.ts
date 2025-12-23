import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
  userId: string;
  role: 'user' | 'admin';
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string | number,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string | number,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
  const days = parseInt(expiresIn.replace('d', ''));
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
