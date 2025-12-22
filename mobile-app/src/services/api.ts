import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, AuthResponse, Product, Cart, Conversation, FriendRequest, User } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token');

            const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );

            if (data.success && data.data) {
              await AsyncStorage.setItem('accessToken', data.data.accessToken);
              await AsyncStorage.setItem('refreshToken', data.data.refreshToken);

              originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<ApiResponse<AuthResponse>>('/auth/register', {
      username,
      email,
      password,
    });
    if (!data.success || !data.data) throw new Error(data.error || 'Registration failed');
    return data.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    if (!data.success || !data.data) throw new Error(data.error || 'Login failed');
    return data.data;
  }

  async logout(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (refreshToken) {
      await this.api.post('/auth/logout', { refreshToken });
    }
  }

  async getMe(): Promise<User> {
    const { data } = await this.api.get<ApiResponse<User>>('/auth/me');
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get user');
    return data.data;
  }

  // Product APIs
  async getProducts(page: number = 1, limit: number = 20, category?: string) {
    const params: any = { page, limit };
    if (category) params.category = category;
    const { data } = await this.api.get('/products', { params });
    if (!data.success) throw new Error(data.error || 'Failed to get products');
    return data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await this.api.get<ApiResponse<Product>>(`/products/${id}`);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get product');
    return data.data;
  }

  async likeProduct(id: string): Promise<Product> {
    const { data } = await this.api.post<ApiResponse<Product>>(`/products/${id}/like`);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to like product');
    return data.data;
  }

  async getFriendsProducts(page: number = 1, limit: number = 20) {
    const { data } = await this.api.get('/products/friends/liked', { params: { page, limit } });
    if (!data.success) throw new Error(data.error || 'Failed to get friends products');
    return data.data;
  }

  // Cart APIs
  async getCart(): Promise<Cart> {
    const { data } = await this.api.get<ApiResponse<Cart>>('/cart');
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get cart');
    return data.data;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const { data } = await this.api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to add to cart');
    return data.data;
  }

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const { data } = await this.api.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to update cart');
    return data.data;
  }

  async removeFromCart(productId: string): Promise<Cart> {
    const { data } = await this.api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to remove from cart');
    return data.data;
  }

  async clearCart(): Promise<void> {
    const { data } = await this.api.delete('/cart');
    if (!data.success) throw new Error(data.error || 'Failed to clear cart');
  }

  // Friends APIs
  async sendFriendRequest(userId: string): Promise<FriendRequest> {
    const { data } = await this.api.post<ApiResponse<FriendRequest>>('/friends/requests', { userId });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to send request');
    return data.data;
  }

  async getPendingRequests(): Promise<FriendRequest[]> {
    const { data } = await this.api.get<ApiResponse<FriendRequest[]>>('/friends/requests');
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get requests');
    return data.data;
  }

  async acceptFriendRequest(requestId: string): Promise<FriendRequest> {
    const { data } = await this.api.post<ApiResponse<FriendRequest>>(`/friends/requests/${requestId}/accept`);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to accept request');
    return data.data;
  }

  async rejectFriendRequest(requestId: string): Promise<FriendRequest> {
    const { data } = await this.api.post<ApiResponse<FriendRequest>>(`/friends/requests/${requestId}/reject`);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to reject request');
    return data.data;
  }

  async getFriends(): Promise<User[]> {
    const { data } = await this.api.get<ApiResponse<User[]>>('/friends');
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get friends');
    return data.data;
  }

  async removeFriend(friendId: string): Promise<void> {
    const { data } = await this.api.delete(`/friends/${friendId}`);
    if (!data.success) throw new Error(data.error || 'Failed to remove friend');
  }

  async searchUsers(query: string): Promise<User[]> {
    const { data } = await this.api.get<ApiResponse<User[]>>('/friends/search', { params: { q: query } });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to search users');
    return data.data;
  }

  // Messages APIs
  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const { data } = await this.api.post<ApiResponse<Conversation>>('/messages/conversations', { userId });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to create conversation');
    return data.data;
  }

  async getConversations(): Promise<Conversation[]> {
    const { data } = await this.api.get<ApiResponse<Conversation[]>>('/messages/conversations');
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get conversations');
    return data.data;
  }

  async getConversation(conversationId: string, limit: number = 50, offset: number = 0): Promise<Conversation> {
    const { data } = await this.api.get<ApiResponse<Conversation>>(`/messages/conversations/${conversationId}`, {
      params: { limit, offset },
    });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get conversation');
    return data.data;
  }

  async sendMessage(conversationId: string, content: string): Promise<Conversation> {
    const { data } = await this.api.post<ApiResponse<Conversation>>(`/messages/conversations/${conversationId}/messages`, {
      content,
    });
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to send message');
    return data.data;
  }

  async markAsRead(conversationId: string): Promise<void> {
    const { data} = await this.api.post(`/messages/conversations/${conversationId}/read`);
    if (!data.success) throw new Error(data.error || 'Failed to mark as read');
  }

  // Search API
  async searchProducts(query: string, mode: 'semantic' | 'keyword' | 'hybrid' = 'hybrid', limit: number = 20) {
    const { data } = await this.api.get('/search', { params: { q: query, mode, limit } });
    if (!data.success) throw new Error(data.error || 'Search failed');
    return data.data;
  }

  // User APIs
  async getUserProfile(userId: string): Promise<User> {
    const { data } = await this.api.get<ApiResponse<User>>(`/users/${userId}`);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to get profile');
    return data.data;
  }

  async updateProfile(updates: { avatar?: string; bio?: string; interests?: string[] }): Promise<User> {
    const { data } = await this.api.put<ApiResponse<User>>('/users/profile', updates);
    if (!data.success || !data.data) throw new Error(data.error || 'Failed to update profile');
    return data.data;
  }
}

export const apiService = new ApiService();
