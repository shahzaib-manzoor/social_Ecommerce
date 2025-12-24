import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

// Public routes
router.get('/:userId', usersController.getProfile.bind(usersController));

// Protected routes
router.put('/profile', authenticate, usersController.updateProfile.bind(usersController));
router.put('/avatar', authenticate, usersController.updateAvatar.bind(usersController));

export default router;
