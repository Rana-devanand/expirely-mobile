import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../types/auth";
import { authService } from "../services/authService";
import { userService } from "../services/user";
import { storage } from "../services/storage";
import { clearProducts } from "./productSlice";
import { resetUI } from "./uiSlice";
import { router } from "expo-router";
import messaging from "@react-native-firebase/messaging";

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (idToken: string, { dispatch }) => {
    dispatch(authSlice.actions.loginStart());
    try {
      const response = await authService.socialLogin("google", idToken);
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        await storage.saveTokens(accessToken, refreshToken);
        await storage.saveUser(user);
        dispatch(
          authSlice.actions.loginSuccess({ user, accessToken, refreshToken }),
        );
        // Register FCM token after successful login (non-blocking)
        dispatch(registerFcmToken() as any);
        return response.data;
      } else {
        dispatch(
          authSlice.actions.loginFailure(
            response.message || "Google login failed",
          ),
        );
        throw new Error(response.message);
      }
    } catch (error: any) {
      dispatch(
        authSlice.actions.loginFailure(error.message || "Google login failed"),
      );
      throw error;
    }
  },
);

/**
 * Registers the device FCM token with the backend.
 * Call this after any successful login (email/google).
 */
export const registerFcmToken = createAsyncThunk(
  "auth/registerFcmToken",
  async () => {
    try {
      // Request notification permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("[FCM] Notification permission not granted.");
        return;
      }

      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        await userService.updateFcmToken(fcmToken);
        console.log("[FCM] Token registered with backend successfully.");
      }
    } catch (error: any) {
      // Non-critical — don't crash login flow
      console.warn("[FCM] Failed to register token:", error.message);
    }
  },
);


export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      // userService is still used for generic logout
      await userService.logout();
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      await storage.clearAll();
      dispatch(authSlice.actions.logout());
      dispatch(clearProducts());
      dispatch(resetUI());
    }
  },
);

export const updateProfileAsync = createAsyncThunk(
  "auth/updateProfile",
  async (
    data: { username?: string; email?: string; avatar_url?: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await userService.updateProfile(data);
      if (response.success) {
        const updatedUser = response.data;
        await storage.saveUser(updatedUser);
        dispatch(authSlice.actions.updateProfileSuccess(updatedUser));
        return updatedUser;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  },
);

export const changePasswordAsync = createAsyncThunk(
  "auth/changePassword",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await userService.changePassword(data);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to change password");
    }
  },
);

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    signUpStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signUpSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    signUpFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  signUpStart,
  signUpSuccess,
  signUpFailure,
  updateTokens,
  clearError,
  updateProfileSuccess,
} = authSlice.actions;

export default authSlice.reducer;
