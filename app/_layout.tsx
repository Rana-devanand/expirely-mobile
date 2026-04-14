import React, { useState, useEffect, useCallback, useRef } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, RootState } from "../src/store";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { useAppTheme } from "../src/hooks/useAppTheme";
import { THEME } from "../src/constants/theme";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplashScreen from "../src/components/AnimatedSplashScreen";
import OnboardingScreen from "../src/screens/OnboardingScreen";
import { View } from "react-native";
import { storage } from "../src/services/storage";
import { loginSuccess, logout, registerFcmToken } from "../src/store/authSlice";
import { setOnboardingComplete } from "../src/store/uiSlice";
import { userService } from "../src/services/user";
import { ExpiryNotificationService } from "../src/services/ExpiryNotificationService";
import { checkForAppUpdate } from "../src/services/inAppUpdate.service";
import { ModalProvider } from "../src/hooks/useGlobalModal";
import GlobalModal from "../src/components/GlobalModal";
import Toast from "react-native-toast-message";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppLayoutContent() {
  const { theme, isDarkMode } = useAppTheme();
  const dispatch = useDispatch();
  const isOnboardingComplete = useSelector(
    (state: RootState) => state.ui.isOnboardingComplete,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const pathname = usePathname();
  const isStartupRedirectDone = useRef(false);
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      console.log("🚀 Starting App Preparation...");
      try {
        // 1. Initial Onboarding Check
        console.log("📦 Checking Onboarding...");
        const isOnboardingDone = await storage.getOnboardingComplete();
        console.log("✅ Onboarding Status:", isOnboardingDone);
        if (isOnboardingDone) {
          dispatch(setOnboardingComplete(true));
        }

        // 2. Initial Auth Check
        console.log("🔑 Checking Refresh Token...");
        const refreshToken = await storage.getRefreshToken();
        console.log("📄 Refresh Token exists:", !!refreshToken);
        let authed = false;

        if (refreshToken) {
          try {
            console.log("🌐 Calling userService.me...");
            const response = await userService.me(refreshToken);
            console.log("📡 userService.me response:", response.success);
            if (response.success) {
              const {
                user,
                accessToken: newAccess,
                refreshToken: newRefresh,
              } = response.data;

              await storage.saveTokens(newAccess, newRefresh);
              await storage.saveUser(user);

              dispatch(
                loginSuccess({
                  user,
                  accessToken: newAccess,
                  refreshToken: newRefresh,
                }),
              );
              // Refresh FCM token silently on each app startup (non-blocking)
              dispatch(registerFcmToken() as any);
              authed = true;
            }
          } catch (e) {
            console.log("⚠️ Session restore failed, cleaning up", e);
            await storage.clearAll();
            dispatch(logout());
          }
        }

        // 3. Initialize Google Sign-In
        console.log("🤖 Initializing Google Sign-In...");
        const { configureGoogleSignIn } =
          await import("../src/services/googleAuth");
        configureGoogleSignIn();
        console.log("✅ Google Sign-In Configured");

        // 3a. Initialize Expiry Notifications
        console.log("🔔 Initializing Notifications...");
        await ExpiryNotificationService.requestPermission();

        // 3b. Check for Google Play in-app update (non-blocking)
        console.log("🔄 Checking for app updates...");
        checkForAppUpdate().catch((e) =>
          console.warn("[Update] Check skipped:", e.message),
        );

        // 4. Startup Redirect Logic
        // In Expo Router, groups like (auth) are skipped in the URL.
        // So /(auth)/login becomes just /login.
        const isAuthPage =
          pathname.includes("login") || pathname.includes("signup");

        console.log(
          "🔀 Redirect Check - Authed:",
          authed,
          "Path:",
          pathname,
          "isAuthPage:",
          isAuthPage,
        );

        if (!authed && !isAuthPage && !isStartupRedirectDone.current) {
          console.log("📍 Redirecting to /login...");
          isStartupRedirectDone.current = true;
          setTimeout(() => {
            router.replace("/login");
          }, 500);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.error("❌ App Prep Error:", e);
      } finally {
        console.log("🎬 App Ready!");
        setIsAppReady(true);
      }
    }

    prepare();
  }, [dispatch, router]); // Removed pathname to prevent re-running on navigation

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  const paperTheme = isDarkMode
    ? {
        ...MD3DarkTheme,
        colors: { ...MD3DarkTheme.colors, primary: theme.colors.primary },
      }
    : {
        ...MD3LightTheme,
        colors: { ...MD3LightTheme.colors, primary: theme.colors.primary },
      };

  return (
    <ModalProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <PaperProvider theme={paperTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {isAppReady && (
              <>
                {!isOnboardingComplete ? (
                  <OnboardingScreen />
                ) : (
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: {
                        backgroundColor: theme.colors.background,
                      },
                    }}
                  >
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="addProduct"
                      options={{
                        presentation: "modal",
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="scanner"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="product/[id]"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                )}
              </>
            )}
            <GlobalModal />
          </GestureHandlerRootView>
          <Toast />
        </PaperProvider>

        {showSplash && (
          <AnimatedSplashScreen
            isReady={isAppReady}
            onAnimationComplete={() => setShowSplash(false)}
          />
        )}
      </View>
    </ModalProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppLayoutContent />
    </Provider>
  );
}
