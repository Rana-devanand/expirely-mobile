import { StyleSheet, Dimensions } from "react-native";
import { ThemeType } from "../../constants/theme";

const { width } = Dimensions.get("window");

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Upper Section with Beige Background
    topSection: {
      backgroundColor: isDarkMode ? "#1E293B" : "#FEF3C7", // Premium beige/navy
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 30,
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      position: "absolute",
      top: 60,
      left: 20,
      right: 20,
      zIndex: 10,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDarkMode ? "#334155" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    deleteButton: {
      backgroundColor: isDarkMode ? "#450A0A" : "#FEE2E2",
      marginLeft: 12,
    },
    imageContainer: {
      width: 160,
      height: 160,
      backgroundColor: "#FFFFFF",
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 60,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    productImage: {
      width: 100,
      height: 100,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 20,
      textAlign: "center",
    },
    statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: "#E0F2FE", // Soft blue
      marginTop: 10,
    },
    statusText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#0EA5E9",
    },
    // Content Section
    content: {
      flex: 1,
      padding: 20,
    },
    countdownCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    countdownValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.success,
    },
    progressBarBg: {
      height: 10,
      backgroundColor: isDarkMode ? "#334155" : "#F1F5F9",
      borderRadius: 5,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: theme.colors.success,
      borderRadius: 5,
    },
    // Grid Section
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    gridItem: {
      width: (width - 52) / 2,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    gridIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#334155" : "#F8FAFC",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    gridLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    gridValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    // Notes Section
    notesCard: {
      backgroundColor: isDarkMode ? "#334155" : "#FEFCE8",
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? "#475569" : "#FEF9C3",
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: isDarkMode ? "#94A3B8" : "#A16207",
      marginBottom: 8,
    },
    notesText: {
      fontSize: 16,
      color: isDarkMode ? "#E2E8F0" : "#713F12",
      lineHeight: 22,
    },
    // Footer
    footer: {
      flexDirection: "row",
      padding: 20,
      paddingBottom: 40,
      gap: 12,
    },
    editBtn: {
      flex: 1,
      height: 56,
      backgroundColor: isDarkMode ? "#334155" : "#F1F5F9",
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    editBtnText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    usedBtn: {
      flex: 2,
      height: 56,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    usedBtnText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
  });
