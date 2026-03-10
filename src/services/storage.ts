import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER: "@auth_user",
  ACCESS_TOKEN: "@auth_access_token",
  REFRESH_TOKEN: "@auth_refresh_token",
  ONBOARDING_COMPLETE: "@onboarding_complete",
};

export const storage = {
  saveOnboardingComplete: async (isComplete: boolean) => {
    try {
      await AsyncStorage.setItem(
        KEYS.ONBOARDING_COMPLETE,
        JSON.stringify(isComplete),
      );
    } catch (e) {
      console.error("Error saving onboarding status", e);
    }
  },

  getOnboardingComplete: async () => {
    try {
      const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return value ? JSON.parse(value) : false;
    } catch (e) {
      return false;
    }
  },

  saveTokens: async (accessToken: string, refreshToken: string) => {
    try {
      await AsyncStorage.multiSet([
        [KEYS.ACCESS_TOKEN, accessToken],
        [KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (e) {
      console.error("Error saving tokens", e);
    }
  },

  getAccessToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    } catch (e) {
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    } catch (e) {
      return null;
    }
  },

  saveUser: async (user: any) => {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Error saving user", e);
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER,
        KEYS.ACCESS_TOKEN,
        KEYS.REFRESH_TOKEN,
      ]);
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  },
};
