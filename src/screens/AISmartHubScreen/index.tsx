import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image as RNImage,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  Sparkles,
  CookingPot,
  Refrigerator,
  Apple,
  ReceiptText,
  CalendarDays,
  ChevronRight,
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
      icon: Refrigerator,
      color: "#3B82F6",
      bgColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
      badge: "Maintenance",
    },
    {
      id: "recipe-gen",
      title: "Zero Waste Cook",
      desc: "Genereate recipes using items expiring soon.",
      icon: CookingPot,
      color: "#F59E0B",
      bgColor: isDarkMode ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB",
      badge: "Top Pick",
    },
    {
      id: "nutrition",
      title: "AI Nutrition Insight",
      desc: "Analyze health benefits of your stock.",
      icon: Apple,
      color: "#10B981",
      bgColor: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "#ECFDF5",
    },
    {
      id: "receipt-scan",
      title: "AI Receipt Scanner",
      desc: "Add multiple items at once from your bill.",
      icon: ReceiptText,
      color: "#8B5CF6",
      bgColor: isDarkMode ? "rgba(139, 92, 246, 0.1)" : "#F5F3FF",
      badge: "Vision",
    },
    {
      id: "meal-plan",
      title: "AI Meal Planner",
      desc: "A personalized 7-day plan for your items.",
      icon: CalendarDays,
      color: "#EC4899",
      bgColor: isDarkMode ? "rgba(236, 72, 153, 0.1)" : "#FDF2F8",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Unlock Smarter Tracking</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.title}>AI Smart Hub</Text>
          <Sparkles
            size={28}
            color={theme.colors.primary}
            style={{ marginLeft: 10 }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Use the power of AI to reduce waste, save money, and eat healthier
          based on your inventory.
        </Text>

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
              } else if (item.id === "receipt-scan") {
                router.push("/receipt-scanner");
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
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.border} />

            {item.badge && (
              <View
                style={[styles.badge, { backgroundColor: item.color + "20" }]}
              >
                <Text style={[styles.badgeText, { color: item.color }]}>
                  {item.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
