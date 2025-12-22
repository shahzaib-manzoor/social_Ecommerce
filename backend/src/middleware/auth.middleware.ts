import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    sendError(res, 'Admin access required', 403);
    return;
  }

  next();
};
