import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';
import { sendSuccess, sendError } from '../../utils/response';

const wishlistService = new WishlistService();

export class WishlistController {
  async addToWishlist(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { productId } = req.body;
      if (!productId) {
        sendError(res, 'Product ID is required', 400);
        return;
      }

      const wishlistItem = await wishlistService.addToWishlist(req.user.userId, productId);
      sendSuccess(res, wishlistItem, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async removeFromWishlist(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { productId } = req.params;
      await wishlistService.removeFromWishlist(req.user.userId, productId);
      sendSuccess(res, { message: 'Product removed from wishlist' });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getMyWishlist(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const items = await wishlistService.getMyWishlist(req.user.userId);
      sendSuccess(res, items);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getCombinedWishlist(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const items = await wishlistService.getCombinedWishlist(req.user.userId);
      sendSuccess(res, items);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async shareWithFriends(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { productId, friendIds } = req.body;
      if (!productId || !Array.isArray(friendIds)) {
        sendError(res, 'Product ID and friend IDs array are required', 400);
        return;
      }

      const wishlistItem = await wishlistService.shareWithFriends(
        req.user.userId,
        productId,
        friendIds
      );
      sendSuccess(res, wishlistItem);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async checkInWishlist(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { productId } = req.params;
      const isInWishlist = await wishlistService.isInWishlist(req.user.userId, productId);
      sendSuccess(res, { isInWishlist });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
