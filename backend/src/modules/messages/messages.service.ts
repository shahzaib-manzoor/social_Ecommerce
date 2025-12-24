import mongoose from 'mongoose';
import { Conversation, IConversation } from './conversation.model';
import { User } from '../users/user.model';

export class MessagesService {
  async getOrCreateConversation(userId1: string, userId2: string): Promise<any> {
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

    const convObj = conversation.toObject();

    // Filter participants to only include the OTHER user (userId2)
    const otherParticipant = convObj.participants.filter(
      (p: any) => p._id.toString() !== userId1
    );

    // Return transformed conversation
    return {
      _id: convObj._id,
      participants: otherParticipant,
      messages: [],
      createdAt: convObj.createdAt,
      updatedAt: convObj.updatedAt,
    };
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

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username avatar')
      .sort({ lastMessageAt: -1 });

    // Transform conversations for frontend
    return conversations.map((conv) => {
      const convObj = conv.toObject();

      // Filter participants to only include the OTHER user
      const otherParticipant = convObj.participants.filter(
        (p: any) => p._id.toString() !== userId
      );

      // Get last message
      const lastMsg = convObj.messages.length > 0
        ? convObj.messages[convObj.messages.length - 1]
        : null;

      // Count unread messages (messages from other user that haven't been read)
      const unreadCount = convObj.messages.filter(
        (msg: any) => msg.senderId.toString() !== userId && !msg.read
      ).length;

      return {
        _id: convObj._id,
        participants: otherParticipant,
        lastMessage: lastMsg ? {
          content: lastMsg.content,
          sender: lastMsg.senderId.toString(),
          createdAt: lastMsg.createdAt,
        } : undefined,
        unreadCount,
        updatedAt: convObj.updatedAt,
      };
    });
  }

  async getConversation(conversationId: string, userId: string, limit: number = 50, offset: number = 0): Promise<any> {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'username avatar')
      .populate('messages.senderId', 'username avatar');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is a participant
    if (!conversation.participants.some((id: any) => id._id.equals(new mongoose.Types.ObjectId(userId)))) {
      throw new Error('Not authorized to view this conversation');
    }

    const convObj = conversation.toObject();

    // Filter participants to only include the OTHER user
    const otherParticipant = convObj.participants.filter(
      (p: any) => p._id.toString() !== userId
    );

    // Pagination: return only requested messages
    const totalMessages = convObj.messages.length;
    const start = Math.max(0, totalMessages - offset - limit);
    const end = totalMessages - offset;

    const paginatedMessages = convObj.messages.slice(start, end);

    // Transform messages to have 'sender' instead of 'senderId'
    const transformedMessages = paginatedMessages.map((msg: any) => ({
      _id: msg._id,
      sender: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt,
      read: msg.read,
    }));

    // Return conversation with transformed data
    return {
      _id: convObj._id,
      participants: otherParticipant,
      messages: transformedMessages,
      createdAt: convObj.createdAt,
      updatedAt: convObj.updatedAt,
    };
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
