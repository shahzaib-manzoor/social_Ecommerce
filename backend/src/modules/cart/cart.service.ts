import mongoose from 'mongoose';
import { Cart, ICart } from './cart.model';
import { Product } from '../products/product.model';
import { AddToCartInput, UpdateCartItemInput } from './cart.validation';

export interface CartWithProducts extends Omit<ICart, 'items'> {
  items: {
    product: any;
    quantity: number;
    subtotal: number;
  }[];
  total: number;
}

export class CartService {
  async getCart(userId: string): Promise<CartWithProducts> {
    let cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({ userId, items: [] });
    }

    // Calculate totals and format response
    const items = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error('Product not found');
        }

        return {
          product: product.toJSON(),
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        };
      })
    );

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      _id: cart._id,
      userId: cart.userId,
      items,
      total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    } as CartWithProducts;
  }

  async addToCart(userId: string, input: AddToCartInput): Promise<CartWithProducts> {
    const { productId, quantity } = input;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex((item) =>
        item.productId.equals(new mongoose.Types.ObjectId(productId))
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId: new mongoose.Types.ObjectId(productId), quantity });
      }

      await cart.save();
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, productId: string, input: UpdateCartItemInput): Promise<CartWithProducts> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(new mongoose.Types.ObjectId(productId))
    );

    if (itemIndex < 0) {
      throw new Error('Product not in cart');
    }

    cart.items[itemIndex].quantity = input.quantity;
    await cart.save();

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string): Promise<CartWithProducts> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => !item.productId.equals(new mongoose.Types.ObjectId(productId))
    );

    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await Cart.findOneAndUpdate({ userId }, { items: [] });
  }
}
