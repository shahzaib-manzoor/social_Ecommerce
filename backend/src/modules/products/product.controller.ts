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
      const [product, reviewsData] = await Promise.all([
        productService.getProduct(id),
        productService.getProductReviews(id, 1, 5), // Get first 5 reviews
      ]);

      if (!product) {
        sendError(res, 'Product not found', 404);
        return;
      }

      // Combine product with reviews and rating
      const productWithReviews = {
        ...product.toObject(),
        reviews: reviewsData.reviews,
        rating: reviewsData.averageRating,
      };

      sendSuccess(res, productWithReviews);
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

  async addReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!rating || !comment) {
        sendError(res, 'Rating and comment are required', 400);
        return;
      }

      if (rating < 1 || rating > 5) {
        sendError(res, 'Rating must be between 1 and 5', 400);
        return;
      }

      const review = await productService.addReview(id, req.user.userId, rating, comment);
      sendSuccess(res, review, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await productService.getProductReviews(id, page, limit);
      sendSuccess(res, result);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
