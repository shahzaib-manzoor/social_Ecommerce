import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[]; // Friends this wishlist item is shared with
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true }); // One product per user
wishlistSchema.index({ userId: 1, createdAt: -1 }); // For user's wishlist
wishlistSchema.index({ sharedWith: 1 }); // For finding shared products

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
