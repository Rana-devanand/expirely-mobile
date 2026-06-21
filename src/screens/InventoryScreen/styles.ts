import { StyleSheet } from "react-native";
import { ThemeType } from "../../constants/theme";

export const getStyles = (theme: ThemeType, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 60,
      marginBottom: theme.spacing.md,
    },
    inventoryLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginHorizontal: theme.spacing.lg,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchPlaceholder: {
      marginLeft: 12,
      color: theme.colors.textSecondary,
      fontSize: 16,
      flex: 1,
    },
    filterScroll: {
      paddingLeft: theme.spacing.lg,
      marginBottom: 16,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 25,
      backgroundColor: theme.colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
    },
    activeFilterChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    activeFilterText: {
      color: "#FFF",
    },
    statsLine: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: 20,
      gap: 8,
    },
    statsText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    warningText: {
      color: theme.colors.warning,
      fontWeight: "600",
    },
    errorText: {
      color: theme.colors.error,
      fontWeight: "600",
    },
    productList: {
      paddingHorizontal: theme.spacing.lg,
      gap: 16,
    },
    // Summary Card Styles
    summaryCard: {
      marginHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 5,
    },
    summaryMain: {
      flex: 1,
    },
    summaryTitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    summaryCount: {
      color: "#FFF",
      fontSize: 28,
      fontWeight: "900",
    },
    summaryIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },

    // Category Section Styles
    categorySection: {
      marginBottom: 24,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: 12,
    },
    categoryTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    categoryCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    categoryList: {
      paddingHorizontal: theme.spacing.lg,
      gap: 12,
    },

    // Product Card
    productCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDarkMode ? 0 : 0.05,
      shadowRadius: 14,
      elevation: isDarkMode ? 0 : 2,
    },
    imageContainer: {
      width: 136,
      height: 112,
      justifyContent: "center",
      alignItems: "center",
      borderTopLeftRadius: 21,
      borderBottomLeftRadius: 21,
    },
    productImage: {
      width: "100%",
      height: "100%",
    },
    productInfo: {
      flex: 1,
      minHeight: 112,
      paddingLeft: 14,
      paddingRight: 12,
      paddingVertical: 12,
      justifyContent: "space-between",
    },
    productName: {
      fontSize: 16,
      lineHeight: 23,
      fontWeight: "800",
      color: theme.colors.text,
    },
    productMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    productMetaText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    productMetaDot: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    productBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    productTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    productTimeText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    productChevron: {
      marginRight: 12,
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    sortOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    activeSortOption: {
      backgroundColor: theme.colors.primary + "10",
      borderColor: theme.colors.primary,
    },
    sortOptionText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    activeSortOptionText: {
      color: theme.colors.primary,
    },
  });
