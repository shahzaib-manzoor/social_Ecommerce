import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart } from '../../types';
import { apiService } from '../../services/api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  return await apiService.getCart();
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity }: { productId: string; quantity: number }) => {
    return await apiService.addToCart(productId, quantity);
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productId, quantity }: { productId: string; quantity: number }) => {
    return await apiService.updateCartItem(productId, quantity);
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: string) => {
    return await apiService.removeFromCart(productId);
  }
);

export const clearCart = createAsyncThunk('cart/clear', async () => {
  await apiService.clearCart();
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
