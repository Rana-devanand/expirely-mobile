import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import {
  Activity,
  Calendar,
  Check,
  ChevronRight,
  Database,
  HelpCircle,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Snowflake,
  SortAsc,
  Thermometer,
  X,
} from "lucide-react-native";
import { RootState } from "../../store";
import { Product } from "../../types";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getStyles } from "./styles";
import { formatRemainingTime } from "../../utils/dateHelpers";

const getZoneColor = (zone?: string) => {
  switch (zone) {
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

const getZoneLabel = (zone?: string) => {
  switch (zone) {
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

export default function InventoryScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const styles = getStyles(theme, isDarkMode);

  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [sortBy, setSortBy] = useState<"expiry" | "name" | "qty">("expiry");
  const [showConsumed, setShowConsumed] = useState(false);
  const [selectedZone, setSelectedZone] = useState<
    "all" | "fridge" | "freezer" | "pantry" | "medicine_box" | "other"
  >("all");

  const getInventoryRemainingLabel = (expiryDate: string) => {
    const value = formatRemainingTime(expiryDate, false);
    if (value === "Expired") return value;
    return value.includes("left")
      ? value.replace("left", "remaining").trim()
      : value;
  };

  const groupedProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesArchive = showConsumed ? p.isConsumed : !p.isConsumed;
      const matchesZone =
        selectedZone === "all" || p.storageLocation === selectedZone;
      return matchesSearch && matchesArchive && matchesZone;
    });

    filtered.sort((a, b) => {
      if (sortBy === "expiry") {
        return (
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "qty") {
        return (b.qty || 1) - (a.qty || 1);
      }
      return 0;
    });

    const groups: { [key: string]: Product[] } = {};
    filtered.forEach((product) => {
      const category = product.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });
    return groups;
  }, [products, searchQuery, selectedZone, showConsumed, sortBy]);

  const categories = Object.keys(groupedProducts).sort();

  const renderProductCard = (product: Product) => {
    const badgeBg =
      product.status === "expired"
        ? theme.colors.expiredBg
        : product.status === "warning"
          ? theme.colors.expiringBg
          : theme.colors.freshBg;

    return (
      <View key={product.id} style={styles.productCard}>
        <View style={[styles.imageContainer, { backgroundColor: badgeBg }]}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
            />
          ) : (
            <Text style={{ fontSize: 30 }}>{getEmoji(product.category)}</Text>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.productMetaRow}>
            <Text style={styles.productMetaText} numberOfLines={1}>
              {product.category}
            </Text>
            <Text style={styles.productMetaDot}>|</Text>
            <Text
              style={[
                styles.productMetaText,
                { color: getZoneColor(product.storageLocation) },
              ]}
              numberOfLines={1}
            >
              {getZoneLabel(product.storageLocation)}
            </Text>
          </View>
          <View style={styles.productBottomRow}>
            <View style={styles.productTimeRow}>
              <Calendar size={14} color={theme.colors.textSecondary} />
              <Text style={styles.productTimeText} numberOfLines={1}>
                {getInventoryRemainingLabel(product.expiryDate)}
              </Text>
            </View>
          </View>
        </View>

        <ChevronRight
          size={16}
          color={theme.colors.textSecondary}
          style={styles.productChevron}
        />
      </View>
    );
  };

  const sortOptions = [
    { id: "expiry", label: "Sort by Expiry", icon: Calendar },
    { id: "name", label: "Sort by Name (A-Z)", icon: SortAsc },
    { id: "qty", label: "Sort by Quantity", icon: Database },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.inventoryLabel}>Smart Tracker</Text>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {showConsumed ? "History" : "Inventory"}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  showConsumed && { backgroundColor: theme.colors.primary },
                  loading && { opacity: 0.5 },
                ]}
                onPress={() => setShowConsumed(!showConsumed)}
                disabled={loading}
              >
                <Database
                  size={22}
                  color={showConsumed ? "#FFF" : theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, loading && { opacity: 0.5 }]}
                onPress={() => setIsSortVisible(true)}
                disabled={loading}
              >
                <SlidersHorizontal size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryTitle}>Total Stock Items</Text>
            <Text style={styles.summaryCount}>{products.length} Products</Text>
          </View>
          <View style={styles.summaryIconContainer}>
            <Package color="#FFF" size={28} />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search items in stock..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {[
            {
              value: "all",
              label: "All Zones",
              icon: Layers,
              color: theme.colors.primary,
            },
            {
              value: "fridge",
              label: "Fridge",
              icon: Thermometer,
              color: "#3B82F6",
            },
            {
              value: "freezer",
              label: "Freezer",
              icon: Snowflake,
              color: "#06B6D4",
            },
            {
              value: "pantry",
              label: "Pantry",
              icon: Package,
              color: "#F59E0B",
            },
            {
              value: "medicine_box",
              label: "Medicine",
              icon: Activity,
              color: "#10B981",
            },
            {
              value: "other",
              label: "Other",
              icon: HelpCircle,
              color: "#64748B",
            },
          ].map((zone) => {
            const isSelected = selectedZone === zone.value;
            const Icon = zone.icon;
            return (
              <TouchableOpacity
                key={zone.value}
                style={[
                  styles.filterChip,
                  isSelected && {
                    borderColor: zone.color,
                    backgroundColor: zone.color + "14",
                  },
                ]}
                onPress={() => setSelectedZone(zone.value as typeof selectedZone)}
                activeOpacity={0.7}
              >
                <Icon
                  size={16}
                  color={isSelected ? zone.color : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterText,
                    isSelected && { color: zone.color, fontWeight: "900" },
                  ]}
                >
                  {zone.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && categories.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
              Loading inventory...
            </Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Layers size={64} color={theme.colors.border} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
              No items found in your inventory
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <Text style={styles.categoryCount}>
                  {groupedProducts[category].length} Items
                </Text>
              </View>
              <View style={styles.categoryList}>
                {groupedProducts[category].map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    disabled={loading}
                    onPress={() => router.push(`/product/${product.id}`)}
                  >
                    {renderProductCard(product)}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={isSortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSortVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Products</Text>
              <TouchableOpacity
                onPress={() => setIsSortVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortOption,
                    isActive && styles.activeSortOption,
                  ]}
                  onPress={() => {
                    setSortBy(option.id as "expiry" | "name" | "qty");
                    setIsSortVisible(false);
                  }}
                >
                  <Icon
                    size={22}
                    color={isActive ? theme.colors.primary : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      isActive && styles.activeSortOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isActive && (
                    <Check size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getEmoji = (category: string) => {
  switch (category?.toLowerCase()) {
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
