import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
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
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Clock,
  Tag,
  BarChart3,
  Calendar,
  AlertCircle,
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
      {/* Top Banner Section */}
      <View style={styles.topSection}>
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
              style={{ width: "100%", height: "100%", borderRadius: 30 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 80 }}>{getEmoji(product.category)}</Text>
          )}
        </View>

        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{product.status.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Expiry Countdown */}
        <View style={styles.countdownCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Clock size={20} color={theme.colors.success} />
              <Text style={styles.cardTitle}>Expiry Countdown</Text>
            </View>
            <Text style={styles.countdownValue}>{product.daysLeft}d</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(0, Math.min(100, (product.daysLeft / 10) * 100))}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Info Grid */}
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
              <BarChart3 size={18} color={theme.colors.warning} />
            </View>
            <Text style={styles.gridLabel}>Days Remaining</Text>
            <Text style={styles.gridValue}>{product.daysLeft} days</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconBox}>
              <Calendar size={18} color="#A78BFA" />
            </View>
            <Text style={styles.gridLabel}>Added On</Text>
            <Text style={styles.gridValue}>{formattedAddedOn}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconBox}>
              <AlertCircle size={18} color={theme.colors.error} />
            </View>
            <Text style={styles.gridLabel}>Expires On</Text>
            <Text style={styles.gridValue}>{formattedExpiry}</Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>
            {product.notes || "No notes added for this product."}
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.editBtn, loading && { opacity: 0.7 }]}
          onPress={() =>
            router.push({
              pathname: "/addProduct",
              params: { id: product.id },
            })
          }
          disabled={loading}
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
