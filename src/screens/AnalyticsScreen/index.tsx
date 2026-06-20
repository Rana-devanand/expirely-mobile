import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getStyles } from "./styles";
import BarChart from "react-native-chart-kit/dist/BarChart";
import PieChart from "react-native-chart-kit/dist/PieChart";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Lightbulb,
} from "lucide-react-native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { width } = Dimensions.get("window");

import { productService } from "../../services/productService";

// Smart fallback tip based on live inventory stats
function buildFallbackInsight(
  stats: { good: number; warning: number; expired: number },
  total: number
): string {
  if (total === 0) return "Add your first product to start tracking expiry dates!";
  if (stats.expired > 0 && stats.warning > 0)
    return `You have ${stats.expired} expired and ${stats.warning} expiring items. Clear expired stock and use the expiring ones soon!`;
  if (stats.expired > 0)
    return `${stats.expired} item${stats.expired > 1 ? "s have" : " has"} expired. Consider disposing them to keep your inventory clean.`;
  if (stats.warning > 0)
    return `${stats.warning} item${stats.warning > 1 ? "s are" : " is"} expiring soon — use ${stats.warning > 1 ? "them" : "it"} before the deadline to avoid waste!`;
  return `All ${stats.good} item${stats.good > 1 ? "s are" : " is"} fresh. Great inventory management — keep it up! 🎉`;
}

export default function AnalyticsScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);

  const { products } = useSelector((state: RootState) => state.products);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isInsightLoading, setIsInsightLoading] = useState<boolean>(false);

  // Status Data Calculation
  const statusStats = useMemo(() => {
    const counts = { good: 0, warning: 0, expired: 0 };
    products.forEach((p) => {
      counts[p.status]++;
    });
    return counts;
  }, [products]);

  const productStatusData = [
    {
      name: "Fresh",
      population: statusStats.good,
      color: "#10B981",
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: "Expiring",
      population: statusStats.warning,
      color: "#F59E0B",
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: "Expired",
      population: statusStats.expired,
      color: "#EF4444",
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
  ];

  // Weekly Expiry Calculation (Monday to Sunday)
  const barData = useMemo(() => {
    const startOfWeek = dayjs().startOf("week").add(1, "day"); // Monday
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    products.forEach((product) => {
      const expiry = dayjs(product.expiryDate);
      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.add(i, "day");
        if (expiry.isSame(day, "day")) {
          counts[i]++;
          break;
        }
      }
    });

    return {
      labels,
      datasets: [{ data: counts }],
    };
  }, [products]);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: theme.colors.border,
      strokeWidth: 0.5,
    },
  };

  const totalItems = products.length;

  useEffect(() => {
    const fetchInsight = async () => {
      // Products not yet loaded from Redux — wait, don't show stale message
      if (totalItems === 0) {
        setAiInsight("");
        return;
      }

      try {
        setIsInsightLoading(true);
        setAiInsight(""); // clear stale message before new fetch

        // getInventoryInsight already unwraps to the inner data object
        const data = await productService.getInventoryInsight();
        if (data?.message) {
          setAiInsight(data.message);
        } else {
          // Fallback based on live inventory state
          setAiInsight(buildFallbackInsight(statusStats, totalItems));
        }
      } catch (error) {
        console.error("Failed to fetch AI insight:", error);
        // Always show something sensible instead of stale "no items" text
        setAiInsight(buildFallbackInsight(statusStats, totalItems));
      } finally {
        setIsInsightLoading(false);
      }
    };

    fetchInsight();
  }, [totalItems, statusStats.good, statusStats.warning, statusStats.expired]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.dateText}>{dayjs().format("MMMM YYYY")}</Text>
          <Text style={styles.title}>Statistics</Text>
        </View>

        {/* Product Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Product Status</Text>
            <Text style={styles.cardSubtitle}>
              {totalItems} total items tracked
            </Text>
          </View>

          <View style={styles.donutContainer}>
            <PieChart
              data={productStatusData}
              width={width * 0.4}
              height={160}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              hasLegend={false}
              absolute
            />

            <View style={styles.chartLabelContainer}>
              {productStatusData.map((item) => (
                <View key={item.name} style={{ gap: 4 }}>
                  <View style={styles.chartLabelItem}>
                    <View style={styles.chartLabelLeft}>
                      <View
                        style={[styles.dot, { backgroundColor: item.color }]}
                      />
                      <Text style={styles.labelText}>{item.name}</Text>
                    </View>
                    <Text style={styles.labelValue}>{item.population}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor: item.color,
                          width: `${totalItems > 0 ? (item.population / totalItems) * 100 : 0}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Weekly Expiry Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Expiry</Text>
            <Text style={styles.cardSubtitle}>
              Items expiring each day this week
            </Text>
          </View>

          <BarChart
            style={{
              paddingRight: 35,
              borderRadius: 16,
            }}
            data={barData}
            width={width - 80}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showBarTops={false}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.gridItem,
              { backgroundColor: isDarkMode ? "#064E3B" : "#D1FAE5" },
            ]}
          >
            <View style={styles.gridIconBox}>
              <TrendingUp
                size={20}
                color={isDarkMode ? "#A7F3D0" : "#059669"}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.gridValue,
                  { color: isDarkMode ? "#A7F3D0" : "#065F46" },
                ]}
              >
                {statusStats.good} items
              </Text>
              <Text
                style={[
                  styles.gridTitle,
                  { color: isDarkMode ? "#D1FAE5" : "#047857" },
                ]}
              >
                Fresh Stock
              </Text>
              <Text
                style={[
                  styles.gridSubtitle,
                  { color: isDarkMode ? "#D1FAE5" : "#047857" },
                ]}
              >
                In good condition
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.gridItem,
              { backgroundColor: isDarkMode ? "#7F1D1D" : "#FEE2E2" },
            ]}
          >
            <View style={styles.gridIconBox}>
              <TrendingDown
                size={20}
                color={isDarkMode ? "#FECACA" : "#B91C1C"}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.gridValue,
                  { color: isDarkMode ? "#FECACA" : "#991B1B" },
                ]}
              >
                {statusStats.expired} items
              </Text>
              <Text
                style={[
                  styles.gridTitle,
                  { color: isDarkMode ? "#FEE2E2" : "#B91C1C" },
                ]}
              >
                Expired Items
              </Text>
              <Text
                style={[
                  styles.gridSubtitle,
                  { color: isDarkMode ? "#FEE2E2" : "#B91C1C" },
                ]}
              >
                Needs disposal
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.gridItem,
              { backgroundColor: isDarkMode ? "#1E3A8A" : "#DBEAFE" },
            ]}
          >
            <View style={styles.gridIconBox}>
              <Package size={20} color={isDarkMode ? "#BFDBFE" : "#2563EB"} />
            </View>
            <View>
              <Text
                style={[
                  styles.gridValue,
                  { color: isDarkMode ? "#BFDBFE" : "#1E40AF" },
                ]}
              >
                {totalItems} items
              </Text>
              <Text
                style={[
                  styles.gridTitle,
                  { color: isDarkMode ? "#DBEAFE" : "#1D4ED8" },
                ]}
              >
                Total Tracked
              </Text>
              <Text
                style={[
                  styles.gridSubtitle,
                  { color: isDarkMode ? "#DBEAFE" : "#1D4ED8" },
                ]}
              >
                All time stock
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.gridItem,
              { backgroundColor: isDarkMode ? "#78350F" : "#FEF3C7" },
            ]}
          >
            <View style={styles.gridIconBox}>
              <AlertTriangle
                size={20}
                color={isDarkMode ? "#FDE68A" : "#D97706"}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.gridValue,
                  { color: isDarkMode ? "#FDE68A" : "#92400E" },
                ]}
              >
                {statusStats.warning} items
              </Text>
              <Text
                style={[
                  styles.gridTitle,
                  { color: isDarkMode ? "#FEF3C7" : "#B45309" },
                ]}
              >
                Expiring Soon
              </Text>
              <Text
                style={[
                  styles.gridSubtitle,
                  { color: isDarkMode ? "#FEF3C7" : "#B45309" },
                ]}
              >
                Next 3 days
              </Text>
            </View>
          </View>
        </View>

        {/* Tip Banner */}
        <TouchableOpacity style={styles.tipBanner} activeOpacity={0.9}>
          <View style={styles.tipContent}>
            <Text style={styles.tipText}>
              {isInsightLoading
                ? "✨ AI is analysing your inventory…"
                : aiInsight
                ? aiInsight
                : totalItems === 0
                ? "Add your first product to start seeing AI-powered insights!"
                : buildFallbackInsight(statusStats, totalItems)}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
