import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);

  // MongoDB duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    sendError(res, 'Duplicate entry found', 409);
    return;
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  // Default error
  sendError(res, err.message || 'Internal server error', 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
