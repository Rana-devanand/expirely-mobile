import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Image as RNImage,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Search,
  PackageCheck,
  Lightbulb,
  Info,
  Snowflake,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { api } from "../../services/api";
import { Product } from "../../types";
import AIEmptyInventoryState from "../../components/AIEmptyInventoryState";

type StorageTipsResponse = {
  success: boolean;
  data: {
    tips: string[];
    fact: string;
    product: string;
  };
};

export default function StorageGuruScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const products = useSelector((state: RootState) => state.products.products);

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    tips: string[];
    fact: string;
    product: string;
  } | null>(null);

  const filteredProducts = products
    .filter((product: Product) =>
      product.name.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8);

  const fetchTips = async (productName: string) => {
    setLoading(true);
    setData(null);
    try {
      const response = await api.get<StorageTipsResponse>(
        `/ai/storage-tips?productName=${encodeURIComponent(productName)}`,
      );
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching storage tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearch("");
    fetchTips(product.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Storage assistant</Text>
          <Text style={styles.title}>AI Storage Guru</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!selectedProduct ? (
          <>
            <View style={styles.heroPanel}>
              <View style={styles.heroIcon}>
                <PackageCheck size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Keep every item fresh longer</Text>
              <Text style={styles.heroSubtitle}>
                Pick a product and get practical storage tips, freshness
                guidance, and shelf-life facts tailored to that item.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Snowflake size={15} color="#3B82F6" />
                  <Text style={styles.heroStatText}>Freshness tips</Text>
                </View>
                <View style={styles.heroStat}>
                  <ShieldCheck size={15} color={theme.colors.success} />
                  <Text style={styles.heroStatText}>Safer storage</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search inventory..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Product</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredProducts.length} shown
              </Text>
            </View>

            {products.length === 0 ? (
              <AIEmptyInventoryState message="Add products to your inventory first, then Storage Guru can suggest freshness tips and better storage habits for each item." />
            ) : (
              filteredProducts.map((product: Product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => handleProductSelect(product)}
                  activeOpacity={0.78}
                >
                  <View style={styles.productLeft}>
                    <View style={styles.productIcon}>
                      {product.imageUrl ? (
                        <RNImage
                          source={{ uri: product.imageUrl }}
                          style={styles.productImage}
                        />
                      ) : (
                        <PackageCheck size={24} color={theme.colors.primary} />
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={styles.productMeta}>
                        {product.category} • {product.daysLeft} days left
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chevronWrap}>
                    <ChevronRight
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => {
                setSelectedProduct(null);
                setData(null);
              }}
            >
              <RefreshCw size={16} color={theme.colors.primary} />
              <Text style={styles.changeButtonText}>Select another product</Text>
            </TouchableOpacity>

            <View style={styles.selectedCard}>
              <View style={styles.selectedIcon}>
                {selectedProduct.imageUrl ? (
                  <RNImage
                    source={{ uri: selectedProduct.imageUrl }}
                    style={styles.productImage}
                  />
                ) : (
                  <PackageCheck size={36} color={theme.colors.primary} />
                )}
              </View>
              <Text style={styles.selectedTitle}>{selectedProduct.name}</Text>
              <Text style={styles.selectedSubtitle}>Storage optimization</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  AI is analyzing storage requirements...
                </Text>
              </View>
            ) : (
              data && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.sectionTitle}>Expert Tips</Text>
                  {data.tips.map((tip, index) => (
                    <View key={index} style={styles.tipCard}>
                      <View style={styles.tipHeader}>
                        <View style={styles.tipIcon}>
                          <Lightbulb size={17} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.tipLabel}>Tip {index + 1}</Text>
                      </View>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}

                  <View style={styles.factCard}>
                    <View style={styles.factHeader}>
                      <Info size={20} color={theme.colors.primary} />
                      <Text style={styles.factLabel}>Did you know?</Text>
                    </View>
                    <Text style={styles.factText}>{data.fact}</Text>
                  </View>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
