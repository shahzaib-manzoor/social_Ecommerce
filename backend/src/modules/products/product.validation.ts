import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().min(0),
  images: z.array(z.string().url()).min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  price: z.number().min(0).optional(),
  images: z.array(z.string().url()).min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export const likeProductSchema = z.object({
  productId: z.string(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type LikeProductInput = z.infer<typeof likeProductSchema>;
