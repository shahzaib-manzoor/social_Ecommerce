import { Router } from 'express';
import { FriendsController } from './friends.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const friendsController = new FriendsController();

// All friend routes require authentication
router.use(authenticate);

router.post('/requests', friendsController.sendFriendRequest.bind(friendsController));
router.get('/requests', friendsController.getPendingRequests.bind(friendsController));
router.post('/requests/:requestId/accept', friendsController.acceptFriendRequest.bind(friendsController));
router.post('/requests/:requestId/reject', friendsController.rejectFriendRequest.bind(friendsController));
router.get('/', friendsController.getFriends.bind(friendsController));
router.get('/status/:userId', friendsController.getFriendshipStatus.bind(friendsController));
router.delete('/:friendId', friendsController.removeFriend.bind(friendsController));
router.get('/search', friendsController.searchUsers.bind(friendsController));

export default router;
