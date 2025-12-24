import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { sendSuccess, sendError } from '../../utils/response';

const usersService = new UsersService();

export class UsersController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await usersService.getUserProfile(userId);
      sendSuccess(res, profile);
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const updates = req.body;
      const profile = await usersService.updateProfile(req.user.userId, updates);
      sendSuccess(res, profile);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async updateAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { avatar } = req.body;
      if (!avatar) {
        sendError(res, 'Avatar image is required', 400);
        return;
      }

      const profile = await usersService.updateAvatar(req.user.userId, avatar);
      sendSuccess(res, profile);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
