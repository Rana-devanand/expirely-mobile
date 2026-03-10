import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { Product } from "../types";
import { Calendar, Tag, Trash2 } from "lucide-react-native";
import { useDispatch } from "react-redux";
import { removeProduct } from "../store/productSlice";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { theme } = useAppTheme();
  const dispatch = useDispatch();

  const isWarning = product.status === "warning";
  const isExpired = product.status === "expired";

  const statusColor = isExpired
    ? theme.colors.error
    : isWarning
      ? theme.colors.warning
      : theme.colors.success;

  const styles = getStyles(theme, statusColor, isWarning);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconPlaceholder}>
          <Tag size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>
        <TouchableOpacity
          onPress={() => dispatch(removeProduct(product.id))}
          style={styles.deleteButton}
        >
          <Trash2 size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {isExpired ? "Expired" : `${product.daysLeft} days left`}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>{product.expiryDate}</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.max(0, Math.min(100, (product.daysLeft / 14) * 100))}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      {isWarning && <View style={styles.glowOverlay} />}
    </TouchableOpacity>
  );
}

const getStyles = (theme: any, statusColor: string, isWarning: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: "relative",
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    iconPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: "rgba(69, 209, 160, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    category: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    deleteButton: {
      padding: theme.spacing.sm,
    },
    footer: {
      marginTop: theme.spacing.xs,
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "600",
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    dateText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      borderRadius: 3,
    },
    glowOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.3)",
      borderRadius: theme.borderRadius.lg,
    },
  });
