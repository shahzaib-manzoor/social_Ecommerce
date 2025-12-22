import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  embedding: number[];
  createdBy: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    embedding: [
      {
        type: Number,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
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

// Indexes for performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ likes: 1 });

// Vector search index (for semantic search)
// Note: This requires MongoDB Atlas or MongoDB 6.0+ with vector search capability
productSchema.index({ embedding: '2dsphere' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
