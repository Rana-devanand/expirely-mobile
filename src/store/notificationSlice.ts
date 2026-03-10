import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  notificationService,
  Notification,
} from "../services/notificationService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue("Failed to fetch notifications");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch notifications");
    }
  },
);

export const markAsReadAsync = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue("Failed to mark as read");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark as read");
    }
  },
);

export const markAllAsReadAsync = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        return true;
      }
      return rejectWithValue("Failed to mark all as read");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark all as read");
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as Read
      .addCase(markAsReadAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsReadAsync.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(
          (n) => n.id === action.payload,
        );
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsReadAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark All as Read
      .addCase(markAllAsReadAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAllAsReadAsync.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach((n) => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsReadAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addNotification, clearNotificationError } =
  notificationSlice.actions;
export default notificationSlice.reducer;
