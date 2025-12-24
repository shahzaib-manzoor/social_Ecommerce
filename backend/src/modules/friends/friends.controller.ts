import { Request, Response } from 'express';
import { FriendsService } from './friends.service';
import { sendSuccess, sendError } from '../../utils/response';

const friendsService = new FriendsService();

export class FriendsController {
  async sendFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { userId } = req.body;
      const request = await friendsService.sendFriendRequest(req.user.userId, userId);
      sendSuccess(res, request, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async acceptFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { requestId } = req.params;
      const request = await friendsService.acceptFriendRequest(requestId, req.user.userId);
      sendSuccess(res, request);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async rejectFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { requestId } = req.params;
      const request = await friendsService.rejectFriendRequest(requestId, req.user.userId);
      sendSuccess(res, request);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const requests = await friendsService.getPendingRequests(req.user.userId);
      sendSuccess(res, requests);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getFriends(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const friends = await friendsService.getFriends(req.user.userId);
      sendSuccess(res, friends);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async removeFriend(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { friendId } = req.params;
      await friendsService.removeFriend(req.user.userId, friendId);
      sendSuccess(res, { message: 'Friend removed successfully' });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const query = req.query.q as string;
      if (!query) {
        sendError(res, 'Query parameter required', 400);
        return;
      }

      const users = await friendsService.searchUsers(query, req.user.userId);
      sendSuccess(res, users);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getFriendshipStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { userId } = req.params;
      const status = await friendsService.getFriendshipStatus(req.user.userId, userId);
      sendSuccess(res, status);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
