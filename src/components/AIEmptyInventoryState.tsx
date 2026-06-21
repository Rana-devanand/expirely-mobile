import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Box, Plus, Sparkles } from "lucide-react-native";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = {
  title?: string;
  message?: string;
};

export default function AIEmptyInventoryState({
  title = "No products in your inventory yet",
  message = "Add a few items first so these AI tools can generate insights, recipes, and plans from your stock.",
}: Props) {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.card}>
      <View style={styles.iconCluster}>
        <View style={styles.mainIconWrap}>
          <Box size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.sparkleBadge}>
          <Sparkles size={14} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => router.push("/addProduct")}
      >
        <Plus size={18} color="#FFFFFF" />
        <Text style={styles.buttonText}>Add Your First Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 26,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      marginTop: 4,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDarkMode ? 0 : 0.06,
      shadowRadius: 18,
      elevation: isDarkMode ? 0 : 3,
    },
    iconCluster: {
      position: "relative",
      marginBottom: 16,
    },
    mainIconWrap: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "14",
      borderWidth: 1,
      borderColor: theme.colors.primary + "22",
      justifyContent: "center",
      alignItems: "center",
    },
    sparkleBadge: {
      position: "absolute",
      right: -4,
      bottom: -4,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.card,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    message: {
      fontSize: 12,
      lineHeight: 21,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 18,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 13,
      minWidth: 210,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#FFFFFF",
    },
  });
