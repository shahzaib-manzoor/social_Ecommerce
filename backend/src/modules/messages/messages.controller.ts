import { Request, Response } from 'express';
import { MessagesService } from './messages.service';
import { sendSuccess, sendError } from '../../utils/response';

const messagesService = new MessagesService();

export class MessagesController {
  async getOrCreateConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { userId } = req.body;
      const conversation = await messagesService.getOrCreateConversation(req.user.userId, userId);
      sendSuccess(res, conversation);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { conversationId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        sendError(res, 'Message content is required', 400);
        return;
      }

      const conversation = await messagesService.sendMessage(conversationId, req.user.userId, content);
      sendSuccess(res, conversation, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const conversations = await messagesService.getConversations(req.user.userId);
      sendSuccess(res, conversations);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const conversation = await messagesService.getConversation(
        conversationId,
        req.user.userId,
        limit,
        offset
      );
      sendSuccess(res, conversation);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { conversationId } = req.params;
      await messagesService.markMessagesAsRead(conversationId, req.user.userId);
      sendSuccess(res, { message: 'Messages marked as read' });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
