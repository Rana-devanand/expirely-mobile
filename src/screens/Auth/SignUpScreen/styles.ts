import { StyleSheet, Dimensions } from "react-native";
import { ThemeType } from "../../../constants/theme";

const { width } = Dimensions.get("window");

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 30,
      justifyContent: "center", // Centered Vertically
      paddingTop: 40,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 30,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    form: {
      gap: 15,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 15,
      height: 56,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 16,
      marginLeft: 10,
    },
    signUpButton: {
      backgroundColor: theme.colors.primary,
      height: 56,
      borderRadius: theme.borderRadius.md,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    signUpButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 30,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    separatorText: {
      marginHorizontal: 15,
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    socialContainer: {
      gap: 15,
    },
    googleButton: {
      flexDirection: "row",
      backgroundColor: theme.colors.card,
      height: 56,
      borderRadius: theme.borderRadius.md,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    googleIcon: {
      width: 24,
      height: 24,
    },
    googleButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 40,
      gap: 5,
    },
    footerText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    loginLink: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "bold",
    },
    termsText: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 20,
      lineHeight: 18,
    },
    highlight: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });
