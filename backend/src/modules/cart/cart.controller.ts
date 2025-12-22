import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AddToCartInput, UpdateCartItemInput } from './cart.validation';

const cartService = new CartService();

export class CartController {
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const cart = await cartService.getCart(req.user.userId);
      sendSuccess(res, cart);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const input = req.body as AddToCartInput;
      const cart = await cartService.addToCart(req.user.userId, input);
      sendSuccess(res, cart);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { productId } = req.params;
      const input = req.body as UpdateCartItemInput;
      const cart = await cartService.updateCartItem(req.user.userId, productId, input);
      sendSuccess(res, cart);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { productId } = req.params;
      const cart = await cartService.removeFromCart(req.user.userId, productId);
      sendSuccess(res, cart);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      await cartService.clearCart(req.user.userId);
      sendSuccess(res, { message: 'Cart cleared successfully' });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
