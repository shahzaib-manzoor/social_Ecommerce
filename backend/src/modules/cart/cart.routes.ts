import { Router } from 'express';
import { CartController } from './cart.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { addToCartSchema, updateCartItemSchema } from './cart.validation';

const router = Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart.bind(cartController));
router.post('/items', validate(addToCartSchema), cartController.addToCart.bind(cartController));
router.put('/items/:productId', validate(updateCartItemSchema), cartController.updateCartItem.bind(cartController));
router.delete('/items/:productId', cartController.removeFromCart.bind(cartController));
router.delete('/', cartController.clearCart.bind(cartController));

export default router;
