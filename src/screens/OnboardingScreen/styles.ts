import { StyleSheet, Dimensions } from "react-native";
import { ThemeType } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    page: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    swashContainer: {
      position: "absolute",
      top: -50,
      left: -50,
      width: width * 1.5,
      height: width * 1.5,
      borderRadius: width * 0.75,
      transform: [{ rotate: "-15deg" }],
    },
    swashOverlay: {
      position: "absolute",
      top: 100,
      left: 100,
      width: width,
      height: width,
      borderRadius: width / 2,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    illustrationContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
    },
    illustration: {
      width: width,
      height: height,
    },
    bottomFade: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: height * 0.5,
      zIndex: 2,
    },
    textContainer: {
      position: "absolute",
      bottom: 120, // Push above footer
      left: 40,
      right: 40,
      alignItems: "center",
      zIndex: 3,
    },
    title: {
      fontSize: 32,
      fontWeight: "900",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: 16,
      letterSpacing: 0.5,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    description: {
      fontSize: 18,
      color: "rgba(255, 255, 255, 0.9)",
      textAlign: "center",
      lineHeight: 26,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    // Navigation
    footer: {
      position: "absolute",
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    dotContainer: {
      flexDirection: "row",
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    activeDot: {
      width: 24,
      backgroundColor: "#FFFFFF",
    },
    nextButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    nextText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 1,
    },
  });
