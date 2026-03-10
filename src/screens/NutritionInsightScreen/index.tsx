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
  Apple,
  Zap,
  ShieldCheck,
  Timer,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CONFIG } from "../../services/config";
import { Product } from "../../types";

export default function NutritionInsightScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode) as any;
  const router = useRouter();
  const products = useSelector((state: RootState) => state.products.products);

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<{
    benefits: string[];
    consumptionTip: string;
    healthScore: number;
    product: string;
  } | null>(null);

  const filteredProducts = products
    .filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  const fetchInsight = async (product: Product) => {
    setLoading(true);
    setInsight(null);
    try {
      const response = await axios.get(`${CONFIG.API_URL}/ai/health-insight`, {
        params: { productName: product.name, category: product.category },
      });
      if (response.data.success) {
        setInsight(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching health insight:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearch("");
    fetchInsight(product);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "#10B981";
    if (score >= 5) return "#F59E0B";
    return "#EF4444";
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
        <Text style={styles.title}>Nutrition Insight</Text>
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
                placeholder="Search a product for health check..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <Text style={styles.sectionTitle}>Select from your stock</Text>
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
                    <Apple size={24} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={styles.productName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={{
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                setSelectedProduct(null);
                setInsight(null);
              }}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
                ← Select another item
              </Text>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={{ marginTop: 16, color: theme.colors.textSecondary }}
                >
                  AI is analyzing nutrition data...
                </Text>
              </View>
            ) : (
              insight && (
                <View>
                  <View style={styles.scoreCard}>
                    <View
                      style={[
                        styles.scoreCircle,
                        {
                          borderColor:
                            getScoreColor(insight.healthScore) + "20",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.scoreCircle,
                          {
                            width: 100,
                            height: 100,
                            borderWidth: 0,
                            backgroundColor:
                              getScoreColor(insight.healthScore) + "10",
                            marginBottom: 0,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreValue,
                            { color: getScoreColor(insight.healthScore) },
                          ]}
                        >
                          {insight.healthScore}/10
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.title}>{selectedProduct.name}</Text>
                    <Text style={styles.scoreLabel}>Overall Health Score</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Key Benefits</Text>
                  <View style={styles.insightCard}>
                    {insight.benefits.map((benefit, i) => (
                      <View key={i} style={styles.benefitItem}>
                        <View
                          style={[
                            styles.benefitDot,
                            {
                              backgroundColor: getScoreColor(
                                insight.healthScore,
                              ),
                            },
                          ]}
                        />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>Consumption Tip</Text>
                  <View style={styles.tipBox}>
                    <Text style={styles.tipTitle}>Expert Suggestion</Text>
                    <Text style={styles.tipContent}>
                      {insight.consumptionTip}
                    </Text>
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
