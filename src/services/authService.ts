import { api } from "./api";
import { AuthResponse } from "../types/auth";

export const authService = {
  /**
   * Social Login (Google, etc.)
   */
  socialLogin: async (
    provider: "google",
    idToken: string,
    accessToken?: string,
  ) => {
    return api.post<AuthResponse>("/users/social-login", {
      provider,
      idToken,
      accessToken,
    });
  },
};
