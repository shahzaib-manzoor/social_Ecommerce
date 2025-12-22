export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  embedding: number[];
  createdBy: {
    _id: string;
    username: string;
    avatar?: string;
  };
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
