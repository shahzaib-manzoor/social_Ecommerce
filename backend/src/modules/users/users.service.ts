import { User } from './user.model';

export class UsersService {
  async getUserProfile(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updates: { avatar?: string; bio?: string; interests?: string[] }): Promise<any> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
