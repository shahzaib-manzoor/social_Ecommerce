export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  friends: string[];
  interests: string[];
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
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

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  messages: Message[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
