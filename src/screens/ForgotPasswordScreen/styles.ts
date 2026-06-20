import { StyleSheet } from "react-native";
import { ThemeType } from "../../constants/theme";

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
      justifyContent: "center",
    },
    header: {
      marginBottom: 32,
      position: "relative",
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDarkMode ? "#1E293B" : "#F1F5F9",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#F8FAFC",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
      height: "100%",
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
    resendButton: {
      alignSelf: "center",
      marginTop: 16,
      padding: 8,
    },
    resendText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.primary,
    },
  });
