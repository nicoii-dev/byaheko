import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  AppNotification,
  NotificationsState,
} from '../../types';
import { notificationsApi } from '../../services/api/notificationsApi';
import { getErrorMessage } from '../../utils/errors';

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const loadNotifications = createAsyncThunk<
  AppNotification[],
  void,
  { rejectValue: string }
>('notifications/load', async (_, { rejectWithValue }) => {
  try {
    return await notificationsApi.getNotifications();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load notifications.'),
    );
  }
});

export const markNotificationRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await notificationsApi.markRead(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to update this notification.'),
    );
  }
});

export const markAllNotificationsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationsApi.markAllRead();
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to update notifications.'),
    );
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    clearNotificationsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(item => !item.read).length;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to load notifications.';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.items.find(
          item => item.id === action.payload,
        );
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, state => {
        state.items = state.items.map(item => ({ ...item, read: true }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotificationsError } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
