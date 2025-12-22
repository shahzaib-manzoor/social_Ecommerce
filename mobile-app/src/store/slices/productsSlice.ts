import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { apiService } from '../../services/api';

interface ProductsState {
  products: Product[];
  friendsProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: ProductsState = {
  products: [],
  friendsProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async ({ page, limit, category }: { page: number; limit?: number; category?: string }) => {
    return await apiService.getProducts(page, limit, category);
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId: string) => {
    return await apiService.getProduct(productId);
  }
);

export const likeProduct = createAsyncThunk(
  'products/like',
  async (productId: string) => {
    return await apiService.likeProduct(productId);
  }
);

export const searchProducts = createAsyncThunk(
  'products/search',
  async ({ query, mode, limit }: { query: string; mode?: 'semantic' | 'keyword' | 'hybrid'; limit?: number }) => {
    return await apiService.searchProducts(query, mode, limit);
  }
);

export const fetchFriendsProducts = createAsyncThunk(
  'products/fetchFriendsProducts',
  async () => {
    return await apiService.getFriendsProducts();
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.products = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.products = action.payload.products;
        } else {
          state.products = [...state.products, ...action.payload.products];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      .addCase(likeProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.results;
        state.hasMore = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Search failed';
      })
      .addCase(fetchFriendsProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFriendsProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friendsProducts = action.payload.products;
      })
      .addCase(fetchFriendsProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch friends products';
      });
  },
});

export const { clearProducts, clearError } = productsSlice.actions;
export default productsSlice.reducer;
