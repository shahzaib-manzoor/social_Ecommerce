import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateProductInput, UpdateProductInput } from './product.validation';

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const input = req.body as CreateProductInput;
      const product = await productService.createProduct(input, req.user.userId);
      sendSuccess(res, product, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const input = req.body as UpdateProductInput;
      const product = await productService.updateProduct(id, input);
      sendSuccess(res, product);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      sendSuccess(res, { message: 'Product deleted successfully' });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProduct(id);
      if (!product) {
        sendError(res, 'Product not found', 404);
        return;
      }
      sendSuccess(res, product);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;

      const result = await productService.getProducts(page, limit, category);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async likeProduct(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const product = await productService.likeProduct(id, req.user.userId);
      sendSuccess(res, product);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getProductsByFriends(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await productService.getProductsByFriends(req.user.userId, page, limit);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
