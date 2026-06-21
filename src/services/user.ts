import { api } from "./api";
import {
  AuthResponse,
  LoginCredentials,
  SignUpData,
  ProfileResponse,
  ReminderSettings,
} from "../types/auth";

export const userService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/users/login", credentials),

  signUp: (userData: SignUpData) =>
    api.post<AuthResponse>("/users/signup", userData),

  logout: () =>
    api.post<{ success: boolean; message: string }>("/users/logout", {}),

  me: (refreshToken: string) =>
    api.post<AuthResponse>("/users/me", { refreshToken }),

  googleLogin: (idToken: string) =>
    api.post<AuthResponse>("/users/google-login", { idToken }),

  getProfile: (token: string) =>
    api.get<ProfileResponse>("/users/profile", { token }),

  updateProfile: (data: {
    username?: string;
    email?: string;
    avatar_url?: string;
  }) => api.put<ProfileResponse>("/users/profile", data),

  changePassword: (data: any) =>
    api.put<{ success: boolean; message: string }>(
      "/users/change-password",
      data,
    ),

  updateFcmToken: (fcmToken: string) =>
    api.post<{ success: boolean; message: string }>("/users/fcm-token", {
      fcmToken,
    }),

  getReminderSettings: () =>
    api.get<{ success: boolean; data: ReminderSettings }>(
      "/users/reminder-settings",
    ),

  updateReminderSettings: (data: ReminderSettings) =>
    api.patch<{ success: boolean; message: string; data: any }>(
      "/users/reminder-settings",
      data,
    ),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string }>("/users/forgot-password", { email }),

  resetPassword: (data: any) =>
    api.post<{ success: boolean; message: string }>("/users/reset-password", data),
};
