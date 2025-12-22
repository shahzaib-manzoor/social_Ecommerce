import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Conversation } from '../../types';
import { apiService } from '../../services/api';

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk('messages/fetchAll', async () => {
  return await apiService.getConversations();
});

export const fetchConversation = createAsyncThunk(
  'messages/fetch',
  async ({ conversationId, limit, offset }: { conversationId: string; limit?: number; offset?: number }) => {
    return await apiService.getConversation(conversationId, limit, offset);
  }
);

export const createConversation = createAsyncThunk(
  'messages/create',
  async (userId: string) => {
    return await apiService.getOrCreateConversation(userId);
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ conversationId, content }: { conversationId: string; content: string }) => {
    return await apiService.sendMessage(conversationId, content);
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markRead',
  async (conversationId: string) => {
    await apiService.markAsRead(conversationId);
    return conversationId;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversation';
      })
      .addCase(createConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
        state.currentConversation = action.payload;
        const exists = state.conversations.find(c => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Conversation>) => {
        state.currentConversation = action.payload;
        const index = state.conversations.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentConversation, clearError } = messagesSlice.actions;
export default messagesSlice.reducer;
