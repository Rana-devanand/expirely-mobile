import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image as RNImage,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Check,
  Timer,
  Users,
  Sparkles,
  ChefHat,
  Leaf,
  CalendarClock,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { api } from "../../services/api";
import { Product } from "../../types";

type Recipe = {
  title: string;
  servings: string;
  prepTime: string;
  ingredients: string[];
  instructions: string[];
  wasteTip: string;
};

type RecipeResponse = {
  success: boolean;
  data: Recipe;
};

export default function RecipeGeneratorScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const products = useSelector((state: RootState) => state.products.products);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const getDaysLeft = (product: Product) =>
    typeof product.daysLeft === "number"
      ? product.daysLeft
      : Math.ceil(
          (new Date(product.expiryDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );

  const availableProducts = products
    .filter((product: Product) => !product.isConsumed && getDaysLeft(product) >= 0)
    .sort((a: Product, b: Product) => getDaysLeft(a) - getDaysLeft(b))
    .slice(0, 20);

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    setRecipe(null);
    try {
      const response = await api.post<RecipeResponse>("/ai/generate-recipe", {
        ingredients: selectedIngredients,
      });
      if (response.success) {
        setRecipe(response.data);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.eyebrow}>AI recipe builder</Text>
          <Text style={styles.title}>Zero Waste Cook</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!recipe ? (
          <>
            <View style={styles.heroPanel}>
              <View style={styles.heroIcon}>
                <ChefHat size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Cook what is still fresh</Text>
              <Text style={styles.heroSubtitle}>
                Only active, non-expired products are shown here. Pick a few and
                AI will turn them into a low-waste recipe.
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Leaf size={15} color={theme.colors.success} />
                  <Text style={styles.heroStatText}>
                    {availableProducts.length} usable
                  </Text>
                </View>
                <View style={styles.heroStat}>
                  <Check size={15} color={theme.colors.primary} />
                  <Text style={styles.heroStatText}>
                    {selectedIngredients.length} selected
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.selectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Fresh inventory</Text>
                <Text style={styles.sectionSubtitle}>
                  Sorted by nearest expiry date
                </Text>
              </View>
              {selectedIngredients.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {availableProducts.length === 0 ? (
              <View style={styles.emptyCard}>
                <AlertCircle size={24} color={theme.colors.warning} />
                <Text style={styles.emptyTitle}>No fresh products found</Text>
                <Text style={styles.emptyText}>
                  Add active products with future expiry dates to generate a
                  recipe.
                </Text>
              </View>
            ) : (
              <View style={styles.productList}>
                {availableProducts.map((product: Product) => {
                  const isSelected = selectedIngredients.includes(product.name);
                  const daysLeft = getDaysLeft(product);

                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.productItem,
                        isSelected && styles.productItemSelected,
                      ]}
                      onPress={() => toggleIngredient(product.name)}
                      activeOpacity={0.78}
                    >
                      <View style={styles.productLeft}>
                        <View style={styles.productImageWrap}>
                          {product.imageUrl ? (
                            <RNImage
                              source={{ uri: product.imageUrl }}
                              style={styles.productImage}
                            />
                          ) : (
                            <ChefHat size={22} color={theme.colors.primary} />
                          )}
                        </View>
                        <View style={styles.productInfo}>
                          <Text style={styles.productName} numberOfLines={1}>
                            {product.name}
                          </Text>
                          <View style={styles.productMetaRow}>
                            <CalendarClock
                              size={13}
                              color={theme.colors.textSecondary}
                            />
                            <Text style={styles.productMeta}>
                              {daysLeft === 0
                                ? "Expires today"
                                : `${daysLeft} days left`}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleActive,
                        ]}
                      >
                        {isSelected && <Check size={15} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.generateButton,
                {
                  opacity:
                    selectedIngredients.length === 0 ||
                    loading ||
                    availableProducts.length === 0
                      ? 0.6
                      : 1,
                },
              ]}
              disabled={
                selectedIngredients.length === 0 ||
                loading ||
                availableProducts.length === 0
              }
              onPress={generateRecipe}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Sparkles size={22} color="#FFF" />
                  <Text style={styles.generateButtonText}>
                    Generate Recipe
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {loading && (
              <Text style={styles.loadingText}>
                AI is cooking up something special...
              </Text>
            )}
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.editIngredientsButton}
              onPress={() => setRecipe(null)}
            >
              <RefreshCw size={16} color={theme.colors.primary} />
              <Text style={styles.editIngredientsText}>Edit ingredients</Text>
            </TouchableOpacity>

            <View style={styles.recipeCard}>
              <View style={styles.recipeHeroIcon}>
                <ChefHat size={30} color={theme.colors.primary} />
              </View>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>

              <View style={styles.recipeMeta}>
                <View style={styles.metaItem}>
                  <Timer size={14} color={theme.colors.primary} />
                  <Text style={styles.metaText}>{recipe.prepTime}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={14} color={theme.colors.primary} />
                  <Text style={styles.metaText}>
                    {recipe.servings} Servings
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
                Ingredients
              </Text>
              <View style={styles.ingredientList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.recipeIngredientRow}>
                    <View style={styles.recipeIngredientDot} />
                    <Text style={styles.recipeIngredientText}>
                      {ingredient}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              <View style={styles.wasteTip}>
                <Text style={styles.wasteTipTitle}>Zero Waste Tip</Text>
                <Text style={styles.wasteTipText}>{recipe.wasteTip}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.generateButton, styles.secondaryButton]}
              onPress={() => setRecipe(null)}
            >
              <Text style={[styles.generateButtonText, styles.secondaryText]}>
                Try Another Mix
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
