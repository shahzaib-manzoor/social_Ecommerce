import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.validation';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input);
      sendSuccess(res, result, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const result = await authService.refreshAccessToken(refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      await authService.logout(refreshToken);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      sendSuccess(res, req.user);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
