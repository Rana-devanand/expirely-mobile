import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  Sparkles,
  ChefHat,
  HeartPulse,
  ScanBarcode,
  CalendarClock,
  ChevronRight,
  Wand2,
  PackageCheck,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";

export default function AISmartHubScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();

  const features = [
    {
      id: "storage-guru",
      title: "AI Storage Guru",
      desc: "Get expert tips to make your food last longer.",
      meta: "Storage advice",
      icon: PackageCheck,
      color: "#3B82F6",
      bgColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
      badge: "Maintenance",
    },
    {
      id: "recipe-gen",
      title: "Zero Waste Cook",
      desc: "Generate recipes using items expiring soon.",
      meta: "Recipe builder",
      icon: ChefHat,
      color: "#F59E0B",
      bgColor: isDarkMode ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB",
      badge: "Top Pick",
    },
    {
      id: "nutrition",
      title: "AI Nutrition Insight",
      desc: "Analyze health benefits of your stock.",
      meta: "Nutrition score",
      icon: HeartPulse,
      color: "#10B981",
      bgColor: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "#ECFDF5",
    },
    {
      id: "meal-plan",
      title: "AI Meal Planner",
      desc: "A personalized 7-day plan for your items.",
      meta: "Weekly planning",
      icon: CalendarClock,
      color: "#EC4899",
      bgColor: isDarkMode ? "rgba(236, 72, 153, 0.1)" : "#FDF2F8",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color={theme.colors.primary} />
              <Text style={styles.heroBadgeText}>Smart assistant</Text>
            </View>
            <View style={styles.heroIcon}>
              <Wand2 size={24} color={theme.colors.primary} />
            </View>
          </View>
          <Text style={styles.greeting}>AI Smart Hub</Text>
          <Text style={styles.title}>Make every item work harder</Text>
          <Text style={styles.subtitle}>
            Turn your inventory into recipes, meal plans, storage tips, and
            healthier choices before food goes to waste.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.82}
          onPress={() => router.push("/recipe-generator")}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Sparkles size={13} color="#FFFFFF" />
              <Text style={styles.featuredBadgeText}>Recommended</Text>
            </View>
            <Text style={styles.featuredTitle}>Cook with expiring items</Text>
            <Text style={styles.featuredDesc}>
              Build a recipe from what needs attention first.
            </Text>
          </View>
          <View style={styles.featuredIcon}>
            <ChefHat size={30} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Tools</Text>
          <Text style={styles.sectionSubtitle}>{features.length} assistants</Text>
        </View>

        {features.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
              if (item.id === "storage-guru") {
                router.push("/storage-guru");
              } else if (item.id === "recipe-gen") {
                router.push("/recipe-generator");
              } else if (item.id === "nutrition") {
                router.push("/nutrition-insight");
              } else if (item.id === "meal-plan") {
                router.push("/meal-planner");
              } else {
                console.log(`Navigating to ${item.id}`);
              }
            }}
          >
            <View style={[styles.iconBg, { backgroundColor: item.bgColor }]}>
              <item.icon size={28} color={item.color} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.badge && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: item.color + "18" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: item.color }]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDesc}>{item.desc}</Text>
              <Text style={[styles.cardMeta, { color: item.color }]}>
                {item.meta}
              </Text>
            </View>
            <View style={styles.chevronWrap}>
              <ChevronRight size={18} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
