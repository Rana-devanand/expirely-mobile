import React, { useState, useEffect } from "react";
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
  Refrigerator,
  Lightbulb,
  Info,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CONFIG } from "../../services/config";
import { Product } from "../../types";

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
    .filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  const fetchTips = async (productName: string) => {
    setLoading(true);
    setData(null);
    try {
      const response = await axios.get(`${CONFIG.API_URL}/ai/storage-tips`, {
        params: { productName },
      });
      if (response.data.success) {
        setData(response.data.data);
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
        <Text style={styles.title}>AI Storage Guru</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!selectedProduct ? (
          <>
            <View style={styles.searchContainer}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search a product to get tips..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <Text style={styles.sectionTitle}>Select from Inventory</Text>
            {filteredProducts.map((p: Product) => (
              <TouchableOpacity
                key={p.id}
                style={styles.productItem}
                onPress={() => handleProductSelect(p)}
              >
                <View
                  style={[
                    styles.productIcon,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  {p.imageUrl ? (
                    <RNImage
                      source={{ uri: p.imageUrl }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                      }}
                    />
                  ) : (
                    <Refrigerator size={24} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={styles.productName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              style={{
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                setSelectedProduct(null);
                setData(null);
              }}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
                ← Select another product
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <View
                style={[
                  styles.productIcon,
                  {
                    width: 80,
                    height: 80,
                    borderRadius: 25,
                    backgroundColor: theme.colors.primary + "15",
                  },
                ]}
              >
                <Refrigerator size={40} color={theme.colors.primary} />
              </View>
              <Text style={[styles.title, { marginTop: 12 }]}>
                {selectedProduct.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                Storage Optimization
              </Text>
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
                    <View
                      key={index}
                      style={[
                        styles.tipCard,
                        {
                          borderLeftColor:
                            index === 0
                              ? "#3B82F6"
                              : index === 1
                                ? "#F59E0B"
                                : "#10B981",
                        },
                      ]}
                    >
                      <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        <Lightbulb
                          size={18}
                          color={theme.colors.textSecondary}
                        />
                        <Text
                          style={{
                            marginLeft: 8,
                            fontWeight: "bold",
                            color: theme.colors.textSecondary,
                          }}
                        >
                          Tip #{index + 1}
                        </Text>
                      </View>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}

                  <View style={styles.factCard}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Info size={20} color={theme.colors.primary} />
                      <Text
                        style={[
                          styles.factLabel,
                          { marginLeft: 8, marginBottom: 0 },
                        ]}
                      >
                        Did you know?
                      </Text>
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
