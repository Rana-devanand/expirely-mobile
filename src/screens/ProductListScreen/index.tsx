import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RootState } from "../../store";
import { Product } from "../../types";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Layers,
  ChevronRight,
} from "lucide-react-native";
import { getStyles } from "./styles";

export default function ProductListScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const { type, title } = useLocalSearchParams<{
    type: string;
    title: string;
  }>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by type from params
    if (type === "expiring") {
      result = result.filter((p) => p.status === "warning");
    } else if (type === "recent") {
      result = result.slice(-10).reverse();
    }

    // Filter by Search
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [products, type, searchQuery, selectedCategory]);

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() =>
        router.push({
          pathname: "/product/[id]",
          params: { id: item.id },
        })
      }
    >
      <View
        style={[
          styles.iconBg,
          {
            backgroundColor:
              item.status === "expired"
                ? theme.colors.expiredBg
                : item.status === "warning"
                  ? theme.colors.expiringBg
                  : theme.colors.freshBg,
          },
        ]}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <Text style={{ fontSize: 24 }}>{getEmoji(item.category)}</Text>
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemMeta}>
          {item.category} • {item.qty || 1} Pcs
        </Text>
      </View>

      <View
        style={[
          styles.daysBadge,
          {
            backgroundColor:
              item.status === "expired"
                ? theme.colors.expiredBg
                : item.status === "warning"
                  ? theme.colors.expiringBg
                  : theme.colors.freshBg,
          },
        ]}
      >
        <Text
          style={[
            styles.daysText,
            {
              color:
                item.status === "expired"
                  ? theme.colors.error
                  : item.status === "warning"
                    ? theme.colors.warning
                    : theme.colors.success,
            },
          ]}
        >
          {item.daysLeft < 0 ? "Expired" : `${item.daysLeft}d`}
        </Text>
      </View>
      <ChevronRight
        size={18}
        color={theme.colors.border}
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={loading}
        >
          <ChevronLeft
            color={loading ? theme.colors.textSecondary : theme.colors.text}
            size={28}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title || "Products"}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your items..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginTop: 50 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Layers size={64} color={theme.colors.border} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters to find what you're looking
                for.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

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
