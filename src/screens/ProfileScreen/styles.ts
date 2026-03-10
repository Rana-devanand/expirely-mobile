import { StyleSheet } from "react-native";
import { ThemeType } from "../../constants/theme";

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      gap: 16,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDarkMode ? "#1E293B" : "#F1F5F9",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    // Profile Info Section
    profileSection: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 30,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 16,
    },
    avatarCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDarkMode ? "#4C1D95" : "#A78BFA",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarInitials: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#8B5CF6",
      borderWidth: 3,
      borderColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    userName: {
      fontSize: 22,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    // Section List Items
    sectionWrapper: {
      paddingHorizontal: 20,
    },
    sectionLabel: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: 16,
    },
    menuGroup: {
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 24,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    // Theme Item Special Case
    themeDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    logoutText: {
      color: theme.colors.error,
    },
  });
