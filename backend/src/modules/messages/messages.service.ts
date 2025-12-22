import mongoose from 'mongoose';
import { Conversation, IConversation } from './conversation.model';
import { User } from '../users/user.model';

export class MessagesService {
  async getOrCreateConversation(userId1: string, userId2: string): Promise<IConversation> {
    if (userId1 === userId2) {
      throw new Error('Cannot create conversation with yourself');
    }

    // Check if users exist
    const [user1, user2] = await Promise.all([User.findById(userId1), User.findById(userId2)]);

    if (!user1 || !user2) {
      throw new Error('User not found');
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    }).populate('participants', 'username avatar');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [userId1, userId2],
        messages: [],
      });

      conversation = await conversation.populate('participants', 'username avatar');
    }

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify sender is a participant
    if (!conversation.participants.some((id) => id.equals(new mongoose.Types.ObjectId(senderId)))) {
      throw new Error('Not authorized to send message in this conversation');
    }

    // Add message
    conversation.messages.push({
      senderId: new mongoose.Types.ObjectId(senderId),
      content,
      createdAt: new Date(),
      read: false,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return conversation.populate('participants', 'username avatar');
  }

  async getConversations(userId: string): Promise<IConversation[]> {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username avatar')
      .sort({ lastMessageAt: -1 });

    return conversations;
  }

  async getConversation(conversationId: string, userId: string, limit: number = 50, offset: number = 0): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId).populate(
      'participants',
      'username avatar'
    );

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is a participant
    if (!conversation.participants.some((id: any) => id._id.equals(new mongoose.Types.ObjectId(userId)))) {
      throw new Error('Not authorized to view this conversation');
    }

    // Pagination: return only requested messages
    const totalMessages = conversation.messages.length;
    const start = Math.max(0, totalMessages - offset - limit);
    const end = totalMessages - offset;

    const paginatedMessages = conversation.messages.slice(start, end);

    // Return conversation with paginated messages
    const result = conversation.toObject();
    result.messages = paginatedMessages as any;

    return result as IConversation;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Mark all messages from other participant as read
    conversation.messages.forEach((message) => {
      if (!message.senderId.equals(new mongoose.Types.ObjectId(userId))) {
        message.read = true;
      }
    });

    await conversation.save();
  }
}
