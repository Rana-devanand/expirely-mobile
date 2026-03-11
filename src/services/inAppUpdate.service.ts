import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from "sp-react-native-in-app-updates";
import { Platform } from "react-native";

const inAppUpdates = new SpInAppUpdates(false); // false = production mode

/**
 * Checks if a new version is available on the Play Store.
 * If yes, shows a FLEXIBLE update prompt (user can update in background).
 * Call this on app startup.
 */
export const checkForAppUpdate = async (): Promise<void> => {
  // Only run on Android (iOS needs different approach via App Store)
  if (Platform.OS !== "android") return;

  try {
    const result = await inAppUpdates.checkNeedsUpdate();

    if (result.shouldUpdate) {
      console.log(
        `[InAppUpdate] New version available! Current: ${result.storeVersion}`,
      );

      const updateOptions: StartUpdateOptions = {
        updateType: IAUUpdateKind.FLEXIBLE, // User can continue using app while downloading
      };

      await inAppUpdates.startUpdate(updateOptions);
    } else {
      console.log("[InAppUpdate] App is up to date ✅");
    }
  } catch (error: any) {
    // Don't crash the app — update check is non-critical
    console.warn("[InAppUpdate] Update check failed:", error.message);
  }
};

/**
 * Force an IMMEDIATE update (blocks the UI until user updates).
 * Use this for critical security patches.
 */
export const forceAppUpdate = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  try {
    const result = await inAppUpdates.checkNeedsUpdate();
    if (result.shouldUpdate) {
      await inAppUpdates.startUpdate({
        updateType: IAUUpdateKind.IMMEDIATE,
      });
    }
  } catch (error: any) {
    console.warn("[InAppUpdate] Force update failed:", error.message);
  }
};
