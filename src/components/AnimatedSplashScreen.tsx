import React, { useEffect } from "react";
import { StyleSheet, View, Text, Dimensions, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  withRepeat,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
  isReady?: boolean;
}

export default function AnimatedSplashScreen({
  onAnimationComplete,
  isReady = true,
}: AnimatedSplashScreenProps) {
  // Animation values
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);

  const textTitleOpacity = useSharedValue(0);
  const textSubOpacity = useSharedValue(0);
  const textDescOpacity = useSharedValue(0);

  const progressWidth = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  const startTimeRef = React.useRef(Date.now());
  const minDisplayTime = 3000;

  useEffect(() => {
    // 1. Logo Entrance
    logoScale.value = withDelay(
      200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }),
    );
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 1000 }));

    // 2. Staggered Text Entry
    textTitleOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    textSubOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    textDescOpacity.value = withDelay(1600, withTiming(1, { duration: 800 }));

    // 3. Loading Bar Progress
    progressWidth.value = withDelay(
      2000,
      withTiming(width * 0.5, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }, []);

  const startExit = React.useCallback(() => {
    overlayOpacity.value = withTiming(
      0,
      {
        duration: 800,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      },
    );
  }, [onAnimationComplete, overlayOpacity]);

  useEffect(() => {
    let timer: any;
    let safetyTimer: any;

    const checkReady = () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (isReady && elapsed >= minDisplayTime) {
        startExit();
      } else {
        timer = setTimeout(checkReady, 100);
      }
    };

    // Safety timeout: If it takes more than 10 seconds, force exit
    safetyTimer = setTimeout(() => {
      console.log("🚨 Splash safety timeout reached! Forcing exit.");
      startExit();
    }, 10000);

    checkReady();

    return () => {
      if (timer) clearTimeout(timer);
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [isReady, startExit]);

  // Animated Styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const text1Style = useAnimatedStyle(() => ({
    opacity: textTitleOpacity.value,
    transform: [
      { translateY: interpolate(textTitleOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  const text2Style = useAnimatedStyle(() => ({
    opacity: textSubOpacity.value,
    transform: [
      { translateY: interpolate(textSubOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  const text3Style = useAnimatedStyle(() => ({
    opacity: textDescOpacity.value,
    transform: [
      { translateY: interpolate(textDescOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, containerStyle, { zIndex: 9999 }]}
    >
      <LinearGradient
        colors={["#0F172A", "#1E293B", "#020617"]}
        style={styles.container}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.logoWrapper, logoStyle]}>
            <Image
              source={require("../../assets/images/splash-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <View style={styles.textStack}>
            <Animated.Text style={[styles.brandPart2, text2Style]}>
              EXPIRELY
            </Animated.Text>
          </View>

          <View style={styles.loaderContainer}>
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, progressStyle]} />
            </View>
            <Text style={styles.loadingText}>Initializing system...</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBranding}>
            POWERED BY ARTIFICIAL INTELLIGENCE
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  logoWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  glassBackground: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0, 245, 212, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 245, 212, 0.1)",
  },
  logo: {
    width: 140,
    height: 140,
  },
  textStack: {
    alignItems: "center",
    gap: -4,
  },
  brandPart1: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 10,
    marginBottom: 8,
  },
  brandPart2: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  brandPart3: {
    fontSize: 48,
    fontWeight: "300",
    color: "#00F5D4",
    letterSpacing: 6,
  },
  loaderContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  progressBarBg: {
    width: width * 0.5,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00F5D4",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 10,
    color: "#475569",
    letterSpacing: 3,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerBranding: {
    fontSize: 10,
    color: "#334155",
    letterSpacing: 2,
    fontWeight: "bold",
  },
});
