import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
// Use Google AdMob official test interstitial unit ID in __DEV__ mode,
// otherwise use the user-provided Android Interstitial Ad Unit ID from .env.
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : (process.env.EXPO_PUBLIC_AD_INTERSTITIAL_UNIT_ID || TestIds.INTERSTITIAL);


class AdMobService {
  private interstitial: InterstitialAd | null = null;
  private isInitialized = false;
  private onAdDismissedCallback: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      console.log("📢 [AdMobService] Initializing Mobile Ads SDK...");
      await mobileAds().initialize();
      this.isInitialized = true;
      console.log("✅ [AdMobService] Mobile Ads SDK Initialized.");
      this.createAndLoadInterstitial();
    } catch (error) {
      console.error("❌ [AdMobService] Initialization failed:", error);
    }
  }

  private createAndLoadInterstitial() {
    console.log("📢 [AdMobService] Creating Interstitial Ad instance...");

    this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Event listener for Ad Loaded
    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log("✅ [AdMobService] Interstitial Ad Loaded and ready.");
    });

    // Event listener for Ad Dismissed (closed by user)
    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("📢 [AdMobService] Interstitial Ad Closed by user.");
      this.handleAdCompletion();
    });

    // Event listener for Ad Error / Failed to Load
    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn("⚠️ [AdMobService] Interstitial Ad Error:", error);
      this.handleAdCompletion();
    });

    this.interstitial.load();
  }

  private handleAdCompletion() {
    // 1. Run the save callback if set
    if (this.onAdDismissedCallback) {
      const callback = this.onAdDismissedCallback;
      this.onAdDismissedCallback = null;
      callback();
    }

    // 2. Preload the next ad automatically
    this.createAndLoadInterstitial();
  }

  /**
   * Shows the Interstitial Ad if loaded.
   * Triggers onAdDismissed immediately if not loaded or failed.
   */
  public showInterstitialAd(onAdDismissed: () => void) {
    if (this.interstitial && this.interstitial.loaded) {
      console.log("🚀 [AdMobService] Showing Interstitial Ad...");
      this.onAdDismissedCallback = onAdDismissed;
      this.interstitial.show();
    } else {
      console.warn(
        "⚠️ [AdMobService] Interstitial Ad not loaded yet. Falling back to save immediately.",
      );
      onAdDismissed();

      // Attempt to load again if it's not currently loading
      if (!this.interstitial) {
        this.createAndLoadInterstitial();
      } else {
        this.interstitial.load();
      }
    }
  }
}

export const admobService = new AdMobService();
