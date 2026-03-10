import { api } from "./api";
import {
  AuthResponse,
  LoginCredentials,
  SignUpData,
  ProfileResponse,
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
};
