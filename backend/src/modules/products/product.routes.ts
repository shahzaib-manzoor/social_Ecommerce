import { Router } from 'express';
import { ProductController } from './product.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { createProductSchema, updateProductSchema } from './product.validation';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));

// Protected routes (authenticated users)
router.post('/:id/like', authenticate, productController.likeProduct.bind(productController));
router.get('/friends/liked', authenticate, productController.getProductsByFriends.bind(productController));

// Admin-only routes
router.post('/', authenticate, requireAdmin, validate(createProductSchema), productController.createProduct.bind(productController));
router.put('/:id', authenticate, requireAdmin, validate(updateProductSchema), productController.updateProduct.bind(productController));
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct.bind(productController));

export default router;
