import axios, { AxiosInstance } from 'axios';
import { AuthResponse, ApiResponse, Product, CreateProductInput } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh on 401
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );

            if (data.success && data.data) {
              localStorage.setItem('accessToken', data.data.accessToken);
              localStorage.setItem('refreshToken', data.data.refreshToken);

              originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Login failed');
    }

    return data.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await this.api.post('/auth/logout', { refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getMe(): Promise<any> {
    const { data } = await this.api.get<ApiResponse>('/auth/me');
    if (!data.success) {
      throw new Error(data.error || 'Failed to get user');
    }
    return data.data;
  }

  // Product APIs
  async getProducts(page: number = 1, limit: number = 20, category?: string): Promise<any> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) {
      params.append('category', category);
    }

    const { data } = await this.api.get<ApiResponse>(`/products?${params.toString()}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to get products');
    }
    return data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await this.api.get<ApiResponse<Product>>(`/products/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get product');
    }
    return data.data;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const { data } = await this.api.post<ApiResponse<Product>>('/products', input);
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create product');
    }
    return data.data;
  }

  async updateProduct(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const { data } = await this.api.put<ApiResponse<Product>>(`/products/${id}`, input);
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update product');
    }
    return data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { data } = await this.api.delete<ApiResponse>(`/products/${id}`);
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete product');
    }
  }
}

export const apiService = new ApiService();
