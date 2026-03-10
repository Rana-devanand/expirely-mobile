import { StyleSheet, Dimensions } from "react-native";
import { ThemeType } from "../../constants/theme";

const { width } = Dimensions.get("window");

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 140,
    },
    header: {
      marginBottom: 30,
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    title: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.colors.text,
    },
    // Card Styles
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 32,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    cardHeader: {
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    // Donut Chart Container
    donutContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    chartLabelContainer: {
      flex: 1,
      paddingLeft: 20,
      gap: 16,
    },
    chartLabelItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    chartLabelLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    labelText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    labelValue: {
      fontSize: 15,
      fontWeight: "900",
      color: theme.colors.text,
    },
    progressTrack: {
      height: 6,
      backgroundColor: isDarkMode ? "#1E293B" : "#F1F5F9",
      borderRadius: 3,
      marginTop: 6,
      width: "100%",
    },
    progressBar: {
      height: "100%",
      borderRadius: 3,
    },
    // Grid Layout
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 20,
    },
    gridItem: {
      width: (width - 56) / 2, // 20px padding left/right + 16px gap
      padding: 20,
      borderRadius: 24,
      gap: 12,
    },
    gridIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    gridValue: {
      fontSize: 24,
      fontWeight: "900",
    },
    gridTitle: {
      fontSize: 14,
      fontWeight: "bold",
    },
    gridSubtitle: {
      fontSize: 12,
      opacity: 0.7,
    },
    // Tip Banner
    tipBanner: {
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      padding: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    tipContent: {
      flex: 1,
    },
    tipText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
      lineHeight: 22,
    },
  });
