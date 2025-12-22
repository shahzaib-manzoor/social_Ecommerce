import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        sendError(res, errorMessages, 400);
      } else {
        sendError(res, 'Validation error', 400);
      }
    }
  };
};
