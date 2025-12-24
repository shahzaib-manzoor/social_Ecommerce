import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const wishlistController = new WishlistController();

// All routes require authentication
router.use(authenticate);

// Get user's own wishlist
router.get('/my', wishlistController.getMyWishlist.bind(wishlistController));

// Get combined wishlist (own + friends')
router.get('/combined', wishlistController.getCombinedWishlist.bind(wishlistController));

// Add product to wishlist
router.post('/', wishlistController.addToWishlist.bind(wishlistController));

// Remove product from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist.bind(wishlistController));

// Share wishlist item with friends
router.post('/share', wishlistController.shareWithFriends.bind(wishlistController));

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkInWishlist.bind(wishlistController));

export default router;
