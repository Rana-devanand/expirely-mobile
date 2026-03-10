import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { authService } from "./authService";

/**
 * Call this once when app starts (App.tsx or root layout)
 */
export const configureGoogleSignIn = () => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    console.error(
      "❌ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing in your .env file",
    );
    return;
  }

  GoogleSignin.configure({
    webClientId: webClientId, // MUST be Web client ID from Google Console
    offlineAccess: true, // Enable to get refresh token
  });
};

export interface GoogleSignInResult {
  idToken: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  };
}

export const googleSignInService = {
  /**
   * Sign In with Google
   */
  signIn: async (): Promise<GoogleSignInResult> => {
    try {
      // Ensure Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Start sign-in flow
      const response = await GoogleSignin.signIn();

      // Check if sign-in was successful
      if (response.type !== "success") {
        throw new Error("Sign-in was cancelled");
      }

      const { data } = response;
      const { idToken, user } = data;

      if (!idToken) {
        throw new Error("No ID token received from Google");
      }

      const tokens = await GoogleSignin.getTokens();

      return {
        idToken,
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          photo: user.photo || undefined,
        },
      };
    } catch (error: any) {
      console.log("Google Sign-In Error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("SIGN_IN_CANCELLED");
      }

      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("SIGN_IN_IN_PROGRESS");
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("PLAY_SERVICES_NOT_AVAILABLE");
      }

      throw new Error(error.message || "Google Sign-In failed");
    }
  },

  /**
   * Sign out and then sign in (allows choosing different account)
   */
  signOutAndSignIn: async (): Promise<GoogleSignInResult> => {
    try {
      // Sign out first to clear cached account
      await GoogleSignin.signOut();
      // Then sign in again
      return await googleSignInService.signIn();
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Sign out from Google
   */
  signOut: async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("Google Sign-Out Error:", error);
    }
  },

  /**
   * Revoke access completely
   */
  revokeAccess: async () => {
    try {
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error("Google Revoke Access Error:", error);
    }
  },
};
