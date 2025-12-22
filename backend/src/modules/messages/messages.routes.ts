import { Router } from 'express';
import { MessagesController } from './messages.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const messagesController = new MessagesController();

// All message routes require authentication
router.use(authenticate);

router.post('/conversations', messagesController.getOrCreateConversation.bind(messagesController));
router.get('/conversations', messagesController.getConversations.bind(messagesController));
router.get('/conversations/:conversationId', messagesController.getConversation.bind(messagesController));
router.post('/conversations/:conversationId/messages', messagesController.sendMessage.bind(messagesController));
router.post('/conversations/:conversationId/read', messagesController.markAsRead.bind(messagesController));

export default router;
