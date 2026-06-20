import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import {
  ChevronLeft,
  Search,
  Package,
  Apple,
  Calendar,
  User,
  Filter,
} from "lucide-react-native";
import { adminService, AdminProduct } from "../../src/services/adminService";

type DateFilter = "all" | "today" | "week" | "month";

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

function isWithinRange(dateStr: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();

  if (filter === "today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  if (filter === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }

  if (filter === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  return true;
}

function formatCreatedAt(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminProductsScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllProducts();
      setProducts(data);
      applyFilters(searchQuery, dateFilter, data);
    } catch (error) {
      console.error("Failed to load admin products:", error);
      Alert.alert(
        "Error",
        "Failed to retrieve products. Make sure you are an Admin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await adminService.getAllProducts();
      setProducts(data);
      applyFilters(searchQuery, dateFilter, data);
    } catch (error) {
      console.error("Failed to refresh products:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = (
    query: string,
    dateFilt: DateFilter,
    productList: AdminProduct[]
  ) => {
    let result = productList;

    // Date filter
    result = result.filter((p) => isWithinRange(p.created_at, dateFilt));

    // Search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.addedBy.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort newest first when a date filter is active
    if (dateFilt !== "all") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredProducts(result);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, dateFilter, products);
  };

  const handleDateFilter = (key: DateFilter) => {
    setDateFilter(key);
    applyFilters(searchQuery, key, products);
  };

  const renderItem = ({ item }: { item: AdminProduct }) => {
    const isExpired = item.status === "expired";
    const isExpiring = item.status === "warning";
    const isFresh = item.status === "good";

    let statusColor = "#10B981";
    let statusBg = "rgba(16, 185, 129, 0.15)";
    let statusText = "Fresh";

    if (isExpired) {
      statusColor = "#EF4444";
      statusBg = "rgba(239, 68, 68, 0.15)";
      statusText = "Expired";
    } else if (isExpiring) {
      statusColor = "#F59E0B";
      statusBg = "rgba(245, 158, 11, 0.15)";
      statusText = "Expiring Soon";
    }

    return (
      <View
        style={[
          styles.productCard,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.cardMain}>
          <View
            style={[
              styles.imageContainer,
              {
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.05)"
                  : "#F8FAFC",
              },
            ]}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.productImage}
              />
            ) : (
              <Apple
                size={28}
                color={
                  isFresh ? "#10B981" : isExpiring ? "#F59E0B" : "#EF4444"
                }
              />
            )}
          </View>

          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.productCategory,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.category}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <User size={12} color={theme.colors.textSecondary} />
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.addedBy}
                </Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}
        >
          <View style={styles.footerCol}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Calendar size={13} color={theme.colors.textSecondary} />
              <Text
                style={[
                  styles.footerLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Expiry Date
              </Text>
            </View>
            <Text style={[styles.footerVal, { color: theme.colors.text }]}>
              {item.expiryDate}
            </Text>
          </View>

          <View style={styles.footerCol}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Package size={13} color={theme.colors.textSecondary} />
              <Text
                style={[
                  styles.footerLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Qty
              </Text>
            </View>
            <Text
              style={[
                styles.footerVal,
                { color: theme.colors.text, textAlign: "center" },
              ]}
            >
              {item.qty} units
            </Text>
          </View>

          <View style={[styles.footerCol, { alignItems: "flex-end" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Calendar size={13} color={theme.colors.textSecondary} />
              <Text
                style={[
                  styles.footerLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Added
              </Text>
            </View>
            <Text
              style={[
                styles.footerVal,
                { color: theme.colors.text, textAlign: "right" },
              ]}
            >
              {formatCreatedAt(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: theme.colors.border }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          All Products
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Search
          size={20}
          color={theme.colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search product, category, or owner..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Date Filter Chips */}
      <View style={styles.filterSection}>
        <View style={styles.filterLabelRow}>
          <Filter size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
            Filter by Added Date
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {DATE_FILTERS.map((f) => {
            const isActive = dateFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => handleDateFilter(f.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : isDarkMode
                      ? "#2A2A2A"
                      : "#F1F5F9",
                    borderColor: isActive
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? "#FFFFFF" : theme.colors.textSecondary,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count badge */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
                No products found.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, height: "100%" },
  filterSection: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  filterLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  countRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  countText: { fontSize: 12, fontWeight: "500" },
  listContent: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 8 },
  productCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  productCategory: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerCol: { flex: 1 },
  footerLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  footerVal: { fontSize: 13, fontWeight: "700" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});
