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
  CookingPot,
  Plus,
  Check,
  Timer,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CONFIG } from "../../services/config";
import { Product } from "../../types";

export default function RecipeGeneratorScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const products = useSelector((state: RootState) => state.products.products);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<{
    title: string;
    servings: string;
    prepTime: string;
    ingredients: string[];
    instructions: string[];
    wasteTip: string;
  } | null>(null);

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    setRecipe(null);
    try {
      const response = await axios.post(
        `${CONFIG.API_URL}/ai/generate-recipe`,
        {
          ingredients: selectedIngredients,
        },
      );
      if (response.data.success) {
        setRecipe(response.data.data);
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
        <Text style={styles.title}>Zero Waste Cook</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!recipe ? (
          <>
            <Text style={styles.sectionTitle}>
              Select ingredients from your inventory:
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {products.slice(0, 15).map((p: Product) => {
                const isSelected = selectedIngredients.includes(p.name);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.ingredientItem,
                      {
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                        backgroundColor: isSelected
                          ? theme.colors.primary + "10"
                          : theme.colors.card,
                      },
                    ]}
                    onPress={() => toggleIngredient(p.name)}
                  >
                    {p.imageUrl ? (
                      <RNImage
                        source={{ uri: p.imageUrl }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          marginRight: 8,
                        }}
                      />
                    ) : isSelected ? (
                      <Check
                        size={16}
                        color={theme.colors.primary}
                        style={{ marginRight: 6 }}
                      />
                    ) : (
                      <Plus
                        size={16}
                        color={theme.colors.textSecondary}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={{
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.text,
                        fontWeight: isSelected ? "700" : "500",
                      }}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton,
                {
                  opacity:
                    selectedIngredients.length === 0 || loading ? 0.6 : 1,
                },
              ]}
              disabled={selectedIngredients.length === 0 || loading}
              onPress={generateRecipe}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Sparkles size={22} color="#FFF" />
                  <Text style={styles.generateButtonText}>Generate Recipe</Text>
                </>
              )}
            </TouchableOpacity>

            {loading && (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                AI is cooking up something special...
              </Text>
            )}
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={{
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => setRecipe(null)}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
                ← Edit ingredients
              </Text>
            </TouchableOpacity>

            <View style={styles.recipeCard}>
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
                {recipe.ingredients.map((ing, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.colors.primary,
                        marginRight: 10,
                      }}
                    />
                    <Text style={{ color: theme.colors.text }}>{ing}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions.map((step, i) => (
                <View key={i} style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
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
              style={[
                styles.generateButton,
                {
                  backgroundColor: theme.colors.card,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  shadowColor: "transparent",
                },
              ]}
              onPress={() => setRecipe(null)}
            >
              <Text
                style={[
                  styles.generateButtonText,
                  { color: theme.colors.text },
                ]}
              >
                Try Another Mix
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
