import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

router.get('/:userId', usersController.getProfile.bind(usersController));
router.put('/profile', authenticate, usersController.updateProfile.bind(usersController));

export default router;
