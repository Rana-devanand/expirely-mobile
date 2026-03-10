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
      borderRadius: 14,
      backgroundColor: theme.colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: "900",
      color: theme.colors.text,
    },
    searchSection: {
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: theme.colors.text,
    },
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 8,
    },
    activeCategoryChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    activeCategoryChipText: {
      color: "#FFF",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 16,
    },
    itemCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconBg: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    productImage: {
      width: "100%",
      height: "100%",
      borderRadius: 16,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemMeta: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    daysBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    daysText: {
      fontSize: 12,
      fontWeight: "700",
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 100,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    emptySubtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
  });
