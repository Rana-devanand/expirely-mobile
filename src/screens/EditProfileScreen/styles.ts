import { StyleSheet } from "react-native";
import { ThemeType } from "../../constants/theme";

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: theme.colors.card,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#F1F5F9",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginLeft: 12,
    },
    avatarSection: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 30,
    },
    avatarContainer: {
      position: "relative",
    },
    avatarCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDarkMode ? "#1E293B" : "#F1F5F9",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: theme.colors.card,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarInitials: {
      fontSize: 40,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: theme.colors.card,
    },
    changePhotoText: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    form: {
      paddingHorizontal: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    footer: {
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
