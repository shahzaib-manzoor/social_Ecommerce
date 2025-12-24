import { User } from './user.model';

export class UsersService {
  async getUserProfile(userId: string): Promise<any> {
    const user = await User.findById(userId)
      .select('-passwordHash')
      .populate('friends', 'username avatar bio');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updates: { avatar?: string; bio?: string; interests?: string[] }): Promise<any> {
    // Validate avatar if provided (base64 image)
    if (updates.avatar) {
      if (!this.isValidBase64Image(updates.avatar)) {
        throw new Error('Invalid avatar format. Must be base64 encoded image.');
      }

      // Check size (limit to ~1MB for base64)
      const sizeInBytes = Buffer.from(updates.avatar.substring(updates.avatar.indexOf(',') + 1)).length;
      if (sizeInBytes > 1048576) { // 1MB
        throw new Error('Avatar size must be less than 1MB');
      }
    }

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

  async updateAvatar(userId: string, base64Image: string): Promise<any> {
    if (!this.isValidBase64Image(base64Image)) {
      throw new Error('Invalid image format. Must be base64 encoded image (png, jpg, jpeg, gif, webp).');
    }

    // Check size
    const sizeInBytes = Buffer.from(base64Image.substring(base64Image.indexOf(',') + 1)).length;
    if (sizeInBytes > 1048576) { // 1MB
      throw new Error('Image size must be less than 1MB');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: base64Image } },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private isValidBase64Image(base64String: string): boolean {
    // Check if it's a valid data URL format for images
    const regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    return regex.test(base64String);
  }
}
