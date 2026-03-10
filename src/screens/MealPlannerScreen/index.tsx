import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Calendar,
  Utensils,
  Clock,
  Sparkles,
  RefreshCcw,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import axios from "axios";
import { CONFIG } from "../../services/config";
import { getStyles } from "./styles";

interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
}

interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: { name: string; description: string };
}

export default function MealPlannerScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode) as any;
  const router = useRouter();
  const products = useSelector((state: RootState) => state.products.products);

  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  const generatePlan = async () => {
    if (products.length === 0) {
      Alert.alert("No Items", "Add some items to your inventory first!");
      return;
    }

    setLoading(true);
    try {
      const activeItems = products
        .filter((p) => !p.isConsumed)
        .map((p) => p.name)
        .join(",");

      const response = await axios.get(`${CONFIG.API_URL}/ai/meal-plan`, {
        params: { products: activeItems },
      });

      if (response.data.success) {
        setMealPlan(response.data.data);
      }
    } catch (error) {
      console.error("Meal Plan Error:", error);
      Alert.alert("Error", "Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  const MealCard = ({ type, meal }: { type: string; meal: Meal }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{type}</Text>
        </View>
        <Text style={styles.mealName}>{meal.name}</Text>
      </View>

      <View style={styles.detailRow}>
        <Utensils size={14} color={theme.colors.primary} />
        <Text style={styles.detailTitle}>Ingredients</Text>
      </View>
      <Text style={styles.detailText}>{meal.ingredients.join(", ")}</Text>

      <View style={styles.detailRow}>
        <Clock size={14} color={theme.colors.primary} />
        <Text style={styles.detailTitle}>Instructions</Text>
      </View>
      <Text style={styles.detailText}>{meal.instructions}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Meal Planner</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generatePlan}
          disabled={loading}
        >
          <RefreshCcw size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              Creating your zero-waste meal plan...
            </Text>
          </View>
        ) : mealPlan ? (
          <View>
            <View style={styles.introCard}>
              <Sparkles
                size={24}
                color={theme.colors.primary}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.introTitle}>Your Daily Plan</Text>
              <Text style={styles.introSubtitle}>
                Based on your current inventory, here's a healthy plan for
                today.
              </Text>
            </View>

            <MealCard type="Breakfast" meal={mealPlan.breakfast} />
            <MealCard type="Lunch" meal={mealPlan.lunch} />
            <MealCard type="Dinner" meal={mealPlan.dinner} />

            <View style={styles.snackCard}>
              <Text style={styles.snackLabel}>Today's Snack</Text>
              <Text style={styles.snackName}>{mealPlan.snack.name}</Text>
              <Text style={styles.snackDesc}>{mealPlan.snack.description}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meal plan generated yet.</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generatePlan}
            >
              <Text style={styles.buttonText}>Generate Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
