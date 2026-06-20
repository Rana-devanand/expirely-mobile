import React from "react";
import {
  DimensionValue,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  deleteProductAsync,
  updateProductAsync,
} from "../../store/productSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useGlobalModal } from "../../hooks/useGlobalModal";
import { getStyles } from "./styles";
import { toast } from "../../utils/toast";
import { formatRemainingTime } from "../../utils/dateHelpers";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Clock,
  Tag,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle2,
  StickyNote,
  ListChecks,
} from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import dayjs from "dayjs";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, isDarkMode } = useAppTheme();
  const { showModal } = useGlobalModal();
  const styles = getStyles(theme, isDarkMode);

  const product = useSelector((state: RootState) =>
    state.products.products.find((p) => p.id === id),
  );
  const loading = useSelector((state: RootState) => state.products.loading);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const handleToggleConsumed = async () => {
    try {
      await dispatch(
        updateProductAsync({
          id: product.id,
          data: { isConsumed: !product.isConsumed },
        }),
      ).unwrap();
      toast.success(
        product.isConsumed
          ? "Product marked as active"
          : "Product marked as used",
      );
    } catch (error) {
      toast.error("Failed to update product status");
    }
  };

  const handleDelete = () => {
    showModal({
      title: "Delete Product?",
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      type: "danger",
      onConfirm: async () => {
        try {
          await dispatch(deleteProductAsync(product.id)).unwrap();
          router.back();
        } catch (error) {
          toast.error("Failed to delete product");
        }
      },
    });
  };

  const formattedAddedOn = product.created_at
    ? dayjs(product.created_at).format("MMM D, YYYY")
    : dayjs(product.expiryDate)
        .subtract(product.daysLeft, "day")
        .format("MMM D, YYYY");
  const formattedExpiry = dayjs(product.expiryDate).format("MMM D, YYYY");
  const statusColor =
    product.status === "expired"
      ? theme.colors.error
      : product.status === "warning"
        ? theme.colors.warning
        : theme.colors.success;
  const statusBg =
    product.status === "expired"
      ? theme.colors.expiredBg
      : product.status === "warning"
        ? theme.colors.expiringBg
        : theme.colors.freshBg;
  const progressWidth = `${Math.max(
    0,
    Math.min(100, ((product.daysLeft || 0) / 30) * 100),
  )}%` as DimensionValue;

  const getEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case "dairy":
        return "🥛";
      case "fruit":
        return "🍓";
      case "meat":
        return "🍗";
      case "beverage":
        return "🧃";
      case "bakery":
        return "🍞";
      case "vegetables":
        return "🥦";
      default:
        return "📦";
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { backgroundColor: statusBg }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <ChevronLeft
              size={24}
              color={loading ? theme.colors.textSecondary : theme.colors.text}
            />
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.iconButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Trash2
                size={20}
                color={
                  loading ? theme.colors.textSecondary : theme.colors.error
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 80 }}>{getEmoji(product.category)}</Text>
          )}
        </View>

        <Text style={styles.title}>{product.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {product.isConsumed ? "USED" : product.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.countdownCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Clock size={20} color={statusColor} />
              <Text style={styles.cardTitle}>Expiry Countdown</Text>
            </View>
            <Text style={[styles.countdownValue, { color: statusColor }]}>
              {formatRemainingTime(product.expiryDate, true)}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          <View style={styles.countdownFooter}>
            <Text style={styles.countdownHint}>
              {product.daysLeft < 0
                ? "This item is past its expiry date."
                : "Use this item before the date below."}
            </Text>
            <Text style={[styles.countdownDate, { color: statusColor }]}>
              {formattedExpiry}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.gridIconBox}>
              <Tag size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.gridLabel}>Category</Text>
            <Text style={styles.gridValue}>{product.category}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconBox}>
              <Package size={18} color={theme.colors.warning} />
            </View>
            <Text style={styles.gridLabel}>Quantity</Text>
            <Text style={styles.gridValue}>{product.qty || 1}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconBox}>
              <CheckCircle2 size={18} color={statusColor} />
            </View>
            <Text style={styles.gridLabel}>Remaining</Text>
            <Text style={styles.gridValue}>{formatRemainingTime(product.expiryDate, false)}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconBox}>
              <AlertCircle size={18} color={theme.colors.error} />
            </View>
            <Text style={styles.gridLabel}>Expires On</Text>
            <Text style={styles.gridValue}>{formattedExpiry}</Text>
          </View>
        </View>

        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <StickyNote size={18} color={theme.colors.primary} />
            <Text style={styles.notesLabel}>Notes</Text>
          </View>
          <Text style={styles.notesText}>
            {product.notes || "No notes added for this product."}
          </Text>
        </View>

        {product.ingredients ? (
          <View style={styles.ingredientsCard}>
            <View style={styles.notesHeader}>
              <ListChecks size={18} color={theme.colors.primary} />
              <Text style={styles.notesLabel}>Ingredients</Text>
            </View>
            <View style={styles.ingredientsList}>
              {product.ingredients.split(",").map((item, index) => {
                const trimmed = item.trim();
                if (!trimmed) return null;
                return (
                  <View key={index} style={styles.ingredientRow}>
                    <View style={styles.ingredientDot} />
                    <Text style={styles.ingredientText}>{trimmed}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.editBtn, loading && { opacity: 0.7 }, product.daysLeft < 0 && { opacity: 0.4 }]}
          onPress={() =>
            router.push({
              pathname: "/addProduct",
              params: { id: product.id },
            })
          }
          disabled={loading || product.daysLeft < 0}
        >
          <Pencil size={20} color={theme.colors.text} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.usedBtn,
            product.isConsumed && { backgroundColor: theme.colors.success },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleToggleConsumed}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.usedBtnText}>
              {product.isConsumed ? "Mark as Active" : "Mark as Used"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
