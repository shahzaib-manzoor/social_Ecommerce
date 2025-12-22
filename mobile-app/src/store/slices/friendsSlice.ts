import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, FriendRequest } from '../../types';
import { apiService } from '../../services/api';

interface FriendsState {
  friends: User[];
  pendingRequests: FriendRequest[];
  searchResults: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  pendingRequests: [],
  searchResults: [],
  isLoading: false,
  error: null,
};

export const fetchFriends = createAsyncThunk('friends/fetch', async () => {
  return await apiService.getFriends();
});

export const fetchPendingRequests = createAsyncThunk('friends/fetchPending', async () => {
  return await apiService.getPendingRequests();
});

export const sendFriendRequest = createAsyncThunk(
  'friends/sendRequest',
  async (userId: string) => {
    return await apiService.sendFriendRequest(userId);
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/accept',
  async (requestId: string) => {
    return await apiService.acceptFriendRequest(requestId);
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'friends/reject',
  async (requestId: string) => {
    return await apiService.rejectFriendRequest(requestId);
  }
);

export const removeFriend = createAsyncThunk(
  'friends/remove',
  async (friendId: string) => {
    await apiService.removeFriend(friendId);
    return friendId;
  }
);

export const searchUsers = createAsyncThunk(
  'friends/search',
  async (query: string) => {
    return await apiService.searchUsers(query);
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch friends';
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action: PayloadAction<FriendRequest[]>) => {
        state.pendingRequests = action.payload;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(r => r._id !== action.meta.arg);
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(r => r._id !== action.meta.arg);
      })
      .addCase(removeFriend.fulfilled, (state, action: PayloadAction<string>) => {
        state.friends = state.friends.filter(f => f._id !== action.payload);
      })
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Search failed';
      });
  },
});

export const { clearSearchResults, clearError } = friendsSlice.actions;

// Export action aliases for consistency
export const acceptRequest = acceptFriendRequest;
export const rejectRequest = rejectFriendRequest;

export default friendsSlice.reducer;
