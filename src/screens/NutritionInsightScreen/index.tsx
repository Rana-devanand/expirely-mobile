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
  HeartPulse,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Salad,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { api } from "../../services/api";
import { Product } from "../../types";

type HealthInsightResponse = {
  success: boolean;
  data: {
    benefits: string[];
    consumptionTip: string;
    healthScore: number;
    product: string;
  };
};

export default function NutritionInsightScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
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
    .filter((product: Product) =>
      product.name.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8);

  const fetchInsight = async (product: Product) => {
    setLoading(true);
    setInsight(null);
    try {
      const response = await api.get<HealthInsightResponse>(
        `/ai/health-insight?productName=${encodeURIComponent(
          product.name,
        )}&category=${encodeURIComponent(product.category)}`,
      );
      if (response.success) {
        setInsight(response.data);
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

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Strong choice";
    if (score >= 5) return "Balanced choice";
    return "Use with care";
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
          <Text style={styles.eyebrow}>Health assistant</Text>
          <Text style={styles.title}>Nutrition Insight</Text>
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
                <HeartPulse size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Understand what you eat</Text>
              <Text style={styles.heroSubtitle}>
                Select a product to get an AI health score, key benefits, and a
                simple consumption suggestion.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <ShieldCheck size={15} color={theme.colors.success} />
                  <Text style={styles.heroStatText}>Health score</Text>
                </View>
                <View style={styles.heroStat}>
                  <Salad size={15} color="#10B981" />
                  <Text style={styles.heroStatText}>Food tips</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search product..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose Item</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredProducts.length} shown
              </Text>
            </View>

            {filteredProducts.map((product: Product) => (
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
                      <Apple size={24} color={theme.colors.primary} />
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productMeta}>
                      {product.category}
                    </Text>
                  </View>
                </View>
                <View style={styles.chevronWrap}>
                  <ChevronRight size={18} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => {
                setSelectedProduct(null);
                setInsight(null);
              }}
            >
              <RefreshCw size={16} color={theme.colors.primary} />
              <Text style={styles.changeButtonText}>Select another item</Text>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  AI is analyzing nutrition data...
                </Text>
              </View>
            ) : (
              insight && (
                <View>
                  <View style={styles.scoreCard}>
                    <View
                      style={[
                        styles.scoreRing,
                        { borderColor: getScoreColor(insight.healthScore) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreValue,
                          { color: getScoreColor(insight.healthScore) },
                        ]}
                      >
                        {insight.healthScore}
                      </Text>
                      <Text style={styles.scoreMax}>/10</Text>
                    </View>
                    <Text style={styles.scoreProduct}>
                      {selectedProduct.name}
                    </Text>
                    <View
                      style={[
                        styles.scoreBadge,
                        {
                          backgroundColor:
                            getScoreColor(insight.healthScore) + "14",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreBadgeText,
                          { color: getScoreColor(insight.healthScore) },
                        ]}
                      >
                        {getScoreLabel(insight.healthScore)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Key Benefits</Text>
                  <View style={styles.insightCard}>
                    {insight.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <View
                          style={[
                            styles.benefitIcon,
                            {
                              backgroundColor:
                                getScoreColor(insight.healthScore) + "14",
                            },
                          ]}
                        >
                          <Sparkles
                            size={15}
                            color={getScoreColor(insight.healthScore)}
                          />
                        </View>
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
