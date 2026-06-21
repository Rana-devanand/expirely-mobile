import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { ProductAction } from "../utils/productActions";
import { AlertTriangle, Clock, Snowflake, Calendar, Check, X } from "lucide-react-native";

interface TodaysActionsProps {
  actions: ProductAction[];
  onMarkUsed: (productId: string) => void;
  onDismiss: (productId: string) => void;
  onView: (productId: string) => void;
}

export default function TodaysActions({
  actions,
  onMarkUsed,
  onDismiss,
  onView,
}: TodaysActionsProps) {
  const { theme, isDarkMode } = useAppTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (actions.length === 0) return null;

  const getActionStyles = (type: string) => {
    switch (type) {
      case "EXPIRED":
        return {
          icon: AlertTriangle,
          color: theme.colors.error,
          bg: theme.colors.error + "14",
          border: theme.colors.error + "30",
        };
      case "USE_TODAY":
        return {
          icon: Clock,
          color: theme.colors.warning,
          bg: theme.colors.warning + "14",
          border: theme.colors.warning + "30",
        };
      case "FREEZE_SUGGESTION":
        return {
          icon: Snowflake,
          color: theme.colors.secondary,
          bg: theme.colors.secondary + "14",
          border: theme.colors.secondary + "30",
        };
      case "EXPIRING_WEEK":
      default:
        return {
          icon: Calendar,
          color: theme.colors.primary,
          bg: theme.colors.primary + "14",
          border: theme.colors.primary + "30",
        };
    }
  };

  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleCluster}>
          <Text style={styles.sectionTitle}>Today's Action List</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{actions.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {(isExpanded ? actions : actions.slice(0, 5)).map((action) => {
          const config = getActionStyles(action.type);
          const Icon = config.icon;

          return (
            <View key={action.id} style={[styles.card, { borderColor: config.border }]}>
              {/* Left Color Bar */}
              <View style={[styles.colorIndicator, { backgroundColor: config.color }]} />

              {/* Clickable Card Body */}
              <TouchableOpacity
                style={styles.cardBody}
                activeOpacity={0.7}
                onPress={() => onView(action.productId)}
              >
                <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                  <Icon size={20} color={config.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {action.title}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {action.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Mark Used (Circular Checkmark Button on the Right) */}
              <View style={styles.rightActionsContainer}>
                <TouchableOpacity
                  style={styles.circularUseButton}
                  activeOpacity={0.6}
                  onPress={() => onMarkUsed(action.productId)}
                >
                  <Check size={18} color={theme.colors.success} />
                </TouchableOpacity>
              </View>

              {/* Absolute Positioned Dismiss Button */}
              <TouchableOpacity
                style={styles.absoluteDismissButton}
                activeOpacity={0.6}
                onPress={() => onDismiss(action.id)}
              >
                <X size={12} color={theme.colors.expiringBg} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {actions.length > 5 && (
        <TouchableOpacity
          style={styles.expandButton}
          activeOpacity={0.8}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? "Show Less" : `Show More (+${actions.length - 5})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    titleCluster: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    countBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primary + "18",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    countText: {
      fontSize: 11,
      fontWeight: "900",
      color: theme.colors.primary,
    },
    list: {
      gap: theme.spacing.sm,
    },
    card: {
      flexDirection: "row",
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      overflow: "visible",
      position: "relative",
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.15 : 0.04,
      shadowRadius: 8,
      elevation: isDarkMode ? 0 : 2,
      marginBottom : 7,
    },
    colorIndicator: {
      width: 4,
      height: "100%",
      borderTopLeftRadius: theme.borderRadius.md - 1,
      borderBottomLeftRadius: theme.borderRadius.md - 1,
    },
    cardBody: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingLeft: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
      paddingRight: 28, // extra padding to prevent text from sliding under the X button
    },
    title: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    rightActionsContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingRight: 24,
      paddingLeft: 4,
    },
    circularUseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.success + "12",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.success + "25",
    },
    absoluteDismissButton: {
      position: "absolute",
      top: -7,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: isDarkMode ? "rgba(255, 159, 159, 1)" : "rgba(0, 0, 0, 1)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 30,
    },
    expandButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.sm,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0 : 0.02,
      shadowRadius: 4,
      elevation: isDarkMode ? 0 : 1,
    },
    expandButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.primary,
    },
  });
