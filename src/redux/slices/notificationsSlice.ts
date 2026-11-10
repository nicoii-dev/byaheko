import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationsState } from '../types';
import { notificationsApi } from '../services/api/notificationsApi';

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationsApi.getNotifications();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk<string, string>(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsApi.markRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationRead.fulfilled, (state, action: PayloadAction<string>) => {
        const notification = state.items.find((n) => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;