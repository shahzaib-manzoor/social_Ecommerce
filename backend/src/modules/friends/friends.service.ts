import mongoose from 'mongoose';
import { FriendRequest } from './friendRequest.model';
import { User } from '../users/user.model';

export class FriendsService {
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<any> {
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId),
    ]);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Check if already friends
    if (fromUser.friends.some((id) => id.equals(new mongoose.Types.ObjectId(toUserId)))) {
      throw new Error('Already friends');
    }

    // Check for existing pending request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: fromUserId, to: toUserId, status: 'pending' },
        { from: toUserId, to: fromUserId, status: 'pending' },
      ],
    });

    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    const friendRequest = await FriendRequest.create({
      from: fromUserId,
      to: toUserId,
    });

    return friendRequest;
  }

  async acceptFriendRequest(requestId: string, userId: string): Promise<any> {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.to.toString() !== userId) {
      throw new Error('Not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Add to friends list for both users
    await Promise.all([
      User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } }),
      User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } }),
    ]);

    return request;
  }

  async rejectFriendRequest(requestId: string, userId: string): Promise<any> {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.to.toString() !== userId) {
      throw new Error('Not authorized to reject this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    request.status = 'rejected';
    await request.save();

    return request;
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    const requests = await FriendRequest.find({
      to: userId,
      status: 'pending',
    })
      .populate('from', 'username avatar')
      .sort({ createdAt: -1 });

    return requests;
  }

  async getFriends(userId: string): Promise<any[]> {
    const user = await User.findById(userId).populate('friends', 'username avatar bio');

    if (!user) {
      throw new Error('User not found');
    }

    return user.friends as any[];
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await Promise.all([
      User.findByIdAndUpdate(userId, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: userId } }),
    ]);
  }

  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username avatar bio')
      .limit(20);

    return users;
  }
}
