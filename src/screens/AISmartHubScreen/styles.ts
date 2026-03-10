import { StyleSheet } from "react-native";
import { ThemeType } from "../../constants/theme";

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    greeting: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 4,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      lineHeight: 24,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 5,
    },
    iconBg: {
      width: 64,
      height: 64,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      overflow: "hidden",
    },
    featureImage: {
      width: "100%",
      height: "100%",
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    badge: {
      position: "absolute",
      top: 12,
      right: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
    },
  });
