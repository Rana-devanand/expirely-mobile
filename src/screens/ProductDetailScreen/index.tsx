import React, { useState } from "react";
import {
  DimensionValue,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  deleteProductAsync,
  updateProductAsync,
  fetchProductsAsync,
} from "../../store/productSlice";
import { addShoppingListItemAsync } from "../../store/shoppingSlice";
import {
  logUsageEventAsync,
  fetchProductUsageEventsAsync,
} from "../../store/usageSlice";
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
  Plus,
  Minus,
  History,
  Thermometer,
  Snowflake,
  Activity,
  HelpCircle,
} from "lucide-react-native";
import dayjs from "dayjs";

const getZoneIcon = (location?: string) => {
  switch (location) {
    case "fridge":
      return Thermometer;
    case "freezer":
      return Snowflake;
    case "pantry":
      return Package;
    case "medicine_box":
      return Activity;
    case "other":
    default:
      return HelpCircle;
  }
};

const getZoneColor = (location?: string) => {
  switch (location) {
    case "fridge":
      return "#3B82F6";
    case "freezer":
      return "#06B6D4";
    case "pantry":
      return "#F59E0B";
    case "medicine_box":
      return "#10B981";
    case "other":
    default:
      return "#64748B";
  }
};

const getZoneLabel = (location?: string) => {
  switch (location) {
    case "fridge":
      return "Fridge";
    case "freezer":
      return "Freezer";
    case "pantry":
      return "Pantry";
    case "medicine_box":
      return "Medicine";
    case "other":
    default:
      return "Other";
  }
};

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

  const { logs } = useSelector((state: RootState) => state.usage);

  const [isUsageModalVisible, setIsUsageModalVisible] = useState(false);
  const [usageType, setUsageType] = useState<"USED_FULLY" | "USED_PARTIALLY" | "WASTED">("USED_FULLY");
  const [usageQty, setUsageQty] = useState(1);
  const [usageNote, setUsageNote] = useState("");
  const [loggingEvent, setLoggingEvent] = useState(false);

  React.useEffect(() => {
    dispatch(fetchProductUsageEventsAsync(product.id));
  }, [dispatch, product.id]);

  const handleToggleConsumed = async () => {
    if (!product.isConsumed) {
      setIsUsageModalVisible(true);
      return;
    }

    try {
      await dispatch(
        updateProductAsync({
          id: product.id,
          data: { isConsumed: false, qty: 1 },
        })
      ).unwrap();

      await dispatch(fetchProductsAsync()).unwrap();
      toast.success("Product marked as active");
    } catch (error) {
      toast.error("Failed to update product status");
    }
  };

  const handleLogUsage = async () => {
    try {
      setLoggingEvent(true);
      await dispatch(
        logUsageEventAsync({
          productId: product.id,
          data: {
            type: usageType,
            quantity: usageType === "USED_PARTIALLY" ? usageQty : undefined,
            note: usageNote.trim() || undefined,
          },
        })
      ).unwrap();

      await dispatch(fetchProductsAsync()).unwrap();

      toast.success(
        usageType === "USED_FULLY"
          ? "Product marked as fully consumed"
          : usageType === "WASTED"
            ? "Product marked as wasted"
            : "Logged partial consumption"
      );

      setIsUsageModalVisible(false);
      setUsageNote("");
      setUsageQty(1);

      showModal({
        title: "Add to Shopping List?",
        message: `Would you like to add "${product.name}" to your shopping list to restock?`,
        confirmText: "Add",
        cancelText: "Cancel",
        type: "success",
        onConfirm: () => {
          dispatch(
            addShoppingListItemAsync({
              name: product.name,
              category: product.category,
              qty: 1,
            })
          );
        },
      });
    } catch (err) {
      toast.error("Failed to log product usage");
    } finally {
      setLoggingEvent(false);
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

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {product.isConsumed ? "USED" : product.status.toUpperCase()}
            </Text>
          </View>
        </View>

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
            <Text style={styles.gridValue}>
              {product.remainingQty !== undefined && product.remainingQty !== product.qty
                ? `${product.remainingQty} / ${product.qty || 1}`
                : (product.qty || 1)}
            </Text>
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

          {product.storageLocation && (
            <View style={styles.gridItem}>
              <View style={styles.gridIconBox}>
                {React.createElement(getZoneIcon(product.storageLocation), {
                  size: 18,
                  color: getZoneColor(product.storageLocation),
                })}
              </View>
              <Text style={styles.gridLabel}>Storage Zone</Text>
              <Text style={[styles.gridValue, { color: getZoneColor(product.storageLocation), fontWeight: "900" }]}>
                {getZoneLabel(product.storageLocation)}
              </Text>
            </View>
          )}
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

        {/* Usage History Timeline */}
        <View style={styles.historyCard}>
          <View style={styles.notesHeader}>
            <History size={18} color={theme.colors.primary} />
            <Text style={styles.notesLabel}>Usage History</Text>
          </View>
          {logs.length === 0 ? (
            <Text style={styles.notesText}>No usage events logged for this product.</Text>
          ) : (
            logs.map((log, index) => {
              const dotColor =
                log.type === "USED_FULLY"
                  ? theme.colors.success
                  : log.type === "WASTED"
                    ? theme.colors.error
                    : theme.colors.primary;

              const outcomeLabel =
                log.type === "USED_FULLY"
                  ? "Fully Consumed"
                  : log.type === "WASTED"
                    ? "Wasted / Expired"
                    : `Partially Used (${log.quantity} units)`;

              return (
                <View key={log.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={[styles.historyDot, { backgroundColor: dotColor }]} />
                    {index < logs.length - 1 && <View style={styles.historyLine} />}
                  </View>
                  <View style={styles.historyRight}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyAction}>{outcomeLabel}</Text>
                      <Text style={styles.historyDate}>
                        {dayjs(log.created_at).format("MMM D, h:mm A")}
                      </Text>
                    </View>
                    {log.note ? <Text style={styles.historyNote}>"{log.note}"</Text> : null}
                  </View>
                </View>
              );
            })
          )}
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

      {/* Usage Options Modal */}
      <Modal
        visible={isUsageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUsageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How did you use this?</Text>

            <View style={styles.optionsList}>
              {/* Option: Fully Consumed */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  usageType === "USED_FULLY" && styles.optionCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setUsageType("USED_FULLY")}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: theme.colors.success + "14" }]}>
                  <CheckCircle2 size={20} color={theme.colors.success} />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>Used Fully</Text>
                  <Text style={styles.optionDesc}>Mark item as 100% consumed</Text>
                </View>
              </TouchableOpacity>

              {/* Option: Partially Consumed */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  usageType === "USED_PARTIALLY" && styles.optionCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setUsageType("USED_PARTIALLY");
                  const initialQty = product.remainingQty !== undefined ? product.remainingQty : (product.qty || 1);
                  setUsageQty(Math.max(1, Math.min(1, initialQty)));
                }}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: theme.colors.primary + "14" }]}>
                  <Plus size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>Used Partially</Text>
                  <Text style={styles.optionDesc}>Consume a portion of the product</Text>
                </View>
              </TouchableOpacity>

              {/* Option: Wasted */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  usageType === "WASTED" && styles.optionCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setUsageType("WASTED")}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: theme.colors.error + "14" }]}>
                  <Trash2 size={20} color={theme.colors.error} />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>Wasted / Expired</Text>
                  <Text style={styles.optionDesc}>Log item as thrown away or expired</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quantity Adjuster for Partial consumption */}
            {usageType === "USED_PARTIALLY" && (
              <View>
                <Text style={styles.qtySelectorTitle}>Quantity to Consume</Text>
                <View style={styles.qtySelectorRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setUsageQty(Math.max(0.1, Number((usageQty - 0.5).toFixed(1))))}
                  >
                    <Minus size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyInput}>
                    {usageQty} unit{usageQty !== 1 ? "s" : ""}
                  </Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      const maxLimit = product.remainingQty !== undefined ? product.remainingQty : (product.qty || 1);
                      setUsageQty(Math.min(maxLimit, Number((usageQty + 0.5).toFixed(1))));
                    }}
                  >
                    <Plus size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Note text field */}
            <Text style={styles.qtySelectorTitle}>Usage Note (Optional)</Text>
            <View style={styles.noteInputWrapper}>
              <TextInput
                style={styles.noteTextInput}
                placeholder="e.g., made soup, expired, sour..."
                placeholderTextColor={theme.colors.textSecondary}
                value={usageNote}
                onChangeText={setUsageNote}
                maxLength={100}
                multiline
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsUsageModalVisible(false)}
                disabled={loggingEvent}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleLogUsage}
                disabled={loggingEvent}
              >
                {loggingEvent ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
