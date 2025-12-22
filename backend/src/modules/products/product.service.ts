import mongoose from 'mongoose';
import { Product, IProduct } from './product.model';
import { CreateProductInput, UpdateProductInput } from './product.validation';
import { embeddingService } from '../../utils/embedding';

export class ProductService {
  async createProduct(input: CreateProductInput, adminId: string): Promise<IProduct> {
    const { title, description, tags, ...rest } = input;

    // Generate embedding for the product
    const embedding = await embeddingService.generateProductEmbedding(title, description, tags);

    const product = await Product.create({
      ...rest,
      title,
      description,
      tags,
      embedding,
      createdBy: adminId,
    });

    return product;
  }

  async updateProduct(productId: string, input: UpdateProductInput): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update fields
    Object.assign(product, input);

    // Regenerate embedding if title, description, or tags changed
    if (input.title || input.description || input.tags) {
      const embedding = await embeddingService.generateProductEmbedding(
        product.title,
        product.description,
        product.tags
      );
      product.embedding = embedding;
    }

    await product.save();
    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    const result = await Product.findByIdAndDelete(productId);
    if (!result) {
      throw new Error('Product not found');
    }
  }

  async getProduct(productId: string): Promise<IProduct | null> {
    const product = await Product.findById(productId).populate('createdBy', 'username avatar');
    return product;
  }

  async getProducts(page: number = 1, limit: number = 20, category?: string): Promise<{ products: IProduct[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username avatar'),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async likeProduct(productId: string, userId: string): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = product.likes.some((id) => id.equals(userObjectId));

    if (isLiked) {
      // Unlike
      product.likes = product.likes.filter((id) => !id.equals(userObjectId));
    } else {
      // Like
      product.likes.push(userObjectId);
    }

    await product.save();
    return product;
  }

  async getProductsByFriends(userId: string, page: number = 1, limit: number = 20): Promise<{ products: IProduct[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    // Get user's friends
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendIds = (user as any).friends;

    // Get products liked by friends
    const [products, total] = await Promise.all([
      Product.find({ likes: { $in: friendIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username avatar'),
      Product.countDocuments({ likes: { $in: friendIds } }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
