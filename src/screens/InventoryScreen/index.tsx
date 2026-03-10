import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "../../store";
import { Product } from "../../types";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Package,
  Layers,
  X,
  SortAsc,
  Calendar,
  Database,
  Check,
} from "lucide-react-native";
import { getStyles } from "./styles";

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

  // Grouping & Sorting logic
  const groupedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesArchive = showConsumed ? p.isConsumed : !p.isConsumed;
      return matchesSearch && matchesArchive;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sortBy === "expiry") {
        return (
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "qty") {
        return (b.qty || 1) - (a.qty || 1);
      }
      return 0;
    });

    const groups: { [key: string]: Product[] } = {};
    filtered.forEach((product) => {
      const cat = product.category || "Other";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(product);
    });
    return groups;
  }, [products, searchQuery, sortBy, showConsumed]);

  const categories = Object.keys(groupedProducts).sort();

  const renderProductCard = (product: Product) => {
    const statusColor =
      product.status === "expired"
        ? theme.colors.error
        : product.status === "warning"
          ? theme.colors.warning
          : theme.colors.success;

    const badgeBg =
      product.status === "expired"
        ? theme.colors.expiredBg
        : product.status === "warning"
          ? theme.colors.expiringBg
          : theme.colors.freshBg;

    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 12 }}
            />
          ) : (
            <Text style={{ fontSize: 24 }}>{getEmoji(product.category)}</Text>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productCategory}>
            Qty: {product.qty || 1} • {product.expiryDate}
          </Text>
        </View>

        <View style={[styles.expiryBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.expiryBadgeText, { color: statusColor }]}>
            {product.daysLeft}d
          </Text>
        </View>
        <ChevronRight
          size={16}
          color={theme.colors.border}
          style={{ marginLeft: 8 }}
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
        {/* Header Section */}
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

        {/* Global Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryTitle}>Total Stock Items</Text>
            <Text style={styles.summaryCount}>{products.length} Products</Text>
          </View>
          <View style={styles.summaryIconContainer}>
            <Package color="#FFF" size={28} />
          </View>
        </View>

        {/* Search Section */}
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

        {/* Grouped Content */}
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
                {groupedProducts[category].map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    disabled={loading}
                    onPress={() => router.push(`/product/${p.id}`)}
                  >
                    {renderProductCard(p)}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Sorting Modal */}
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
                    setSortBy(option.id as any);
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
                  {isActive && <Check size={20} color={theme.colors.primary} />}
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
