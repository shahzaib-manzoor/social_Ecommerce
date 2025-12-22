import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponse } from '../../types';
import { apiService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await apiService.login(email, password);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: { username: string; email: string; password: string }) => {
    const response = await apiService.register(username, email, password);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiService.logout();
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) throw new Error('No token');
  return await apiService.getMe();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
