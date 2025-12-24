import mongoose from 'mongoose';
import { Wishlist, IWishlist } from './wishlist.model';
import { Product } from '../products/product.model';
import { User } from '../users/user.model';

export interface WishlistItem {
  _id: mongoose.Types.ObjectId;
  product: any;
  owner: any;
  sharedWith: any[];
  createdAt: Date;
  isOwn: boolean;
}

export class WishlistService {
  // Add product to wishlist
  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      throw new Error('Product already in wishlist');
    }

    const wishlistItem = await Wishlist.create({
      userId,
      productId,
      sharedWith: [],
    });

    return wishlistItem;
  }

  // Remove product from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const result = await Wishlist.findOneAndDelete({ userId, productId });
    if (!result) {
      throw new Error('Product not in wishlist');
    }
  }

  // Get user's wishlist (only their own products)
  async getMyWishlist(userId: string): Promise<WishlistItem[]> {
    const items = await Wishlist.find({ userId })
      .populate('productId')
      .populate('userId', 'username avatar')
      .populate('sharedWith', 'username avatar')
      .sort({ createdAt: -1 });

    return items.map((item) => ({
      _id: item._id,
      product: item.productId,
      owner: item.userId,
      sharedWith: item.sharedWith,
      createdAt: item.createdAt,
      isOwn: true,
    }));
  }

  // Get combined wishlist (user's products + friends' products)
  async getCombinedWishlist(userId: string): Promise<WishlistItem[]> {
    // Get user's friends
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendIds = user.friends.map((id) => id.toString());

    // Get own wishlist items
    const ownItems = await Wishlist.find({ userId })
      .populate('productId')
      .populate('userId', 'username avatar')
      .populate('sharedWith', 'username avatar')
      .sort({ createdAt: -1 });

    // Get friends' wishlist items (only those shared with this user OR public)
    const friendsItems = await Wishlist.find({
      userId: { $in: friendIds },
    })
      .populate('productId')
      .populate('userId', 'username avatar')
      .populate('sharedWith', 'username avatar')
      .sort({ createdAt: -1 });

    // Combine and mark ownership
    const combined: WishlistItem[] = [
      ...ownItems.map((item) => ({
        _id: item._id,
        product: item.productId,
        owner: item.userId,
        sharedWith: item.sharedWith,
        createdAt: item.createdAt,
        isOwn: true,
      })),
      ...friendsItems.map((item) => ({
        _id: item._id,
        product: item.productId,
        owner: item.userId,
        sharedWith: item.sharedWith,
        createdAt: item.createdAt,
        isOwn: false,
      })),
    ];

    // Sort by creation date
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return combined;
  }

  // Share wishlist item with friends
  async shareWithFriends(
    userId: string,
    productId: string,
    friendIds: string[]
  ): Promise<IWishlist> {
    const wishlistItem = await Wishlist.findOne({ userId, productId });
    if (!wishlistItem) {
      throw new Error('Product not in your wishlist');
    }

    // Verify all friendIds are actual friends
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userFriendIds = user.friends.map((id) => id.toString());
    const invalidFriends = friendIds.filter((fid) => !userFriendIds.includes(fid));

    if (invalidFriends.length > 0) {
      throw new Error('Some users are not your friends');
    }

    // Update shared list
    wishlistItem.sharedWith = friendIds.map((id) => new mongoose.Types.ObjectId(id));
    await wishlistItem.save();

    return wishlistItem;
  }

  // Check if product is in user's wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await Wishlist.findOne({ userId, productId });
    return !!item;
  }
}
