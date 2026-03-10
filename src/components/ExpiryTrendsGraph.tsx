import React from "react";
import { View, Text, Dimensions, StyleSheet, ScrollView } from "react-native";
import LineChart from "react-native-chart-kit/dist/line-chart/LineChart";
import { useAppTheme } from "../hooks/useAppTheme";
import { Product } from "../types";
import dayjs from "dayjs";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth * 1.5;

interface Props {
  products: Product[];
}

export default function ExpiryTrendsGraph({ products }: Props) {
  const { theme, isDarkMode } = useAppTheme();

  // Calculate real data
  const generateData = () => {
    const labels: string[] = [];
    const safeData: number[] = [];
    const expiringData: number[] = [];

    const now = dayjs();

    // Generate 7 data points for the next 30 days (roughly every 5 days)
    for (let i = 0; i < 7; i++) {
      const date = now.add(i * 5, "day");
      labels.push(date.format("MMM D"));

      let safeCount = 0;
      let expiringCount = 0;

      products.forEach((p) => {
        const expiry = dayjs(p.expiryDate);
        const daysToExpiry = expiry.diff(date, "day");

        if (daysToExpiry > 7) {
          safeCount++;
        } else if (daysToExpiry >= 0 && daysToExpiry <= 7) {
          expiringCount++;
        }
      });

      safeData.push(safeCount);
      expiringData.push(expiringCount);
    }

    return {
      labels,
      datasets: [
        {
          data: safeData,
          color: (opacity = 1) => `rgba(0, 229, 255, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: expiringData,
          color: (opacity = 1) => `rgba(255, 171, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = generateData();

  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.1})`,
    labelColor: (opacity = 1) => theme.colors.text,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.card,
    },
    propsForBackgroundLines: {
      strokeDasharray: "4",
      stroke: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.05)",
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Expiry Trends
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Next 30 days overview
          </Text>
        </View>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#00E5FF" }]} />
            <Text
              style={[styles.legendText, { color: theme.colors.textSecondary }]}
            >
              Safe
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#FFAB00" }]} />
            <Text
              style={[styles.legendText, { color: theme.colors.textSecondary }]}
            >
              Expiring
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LineChart
          data={chartData}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          fromZero={true}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
          segments={4}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 24,
    padding: 16,
    paddingBottom: 10,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  scrollContent: {
    paddingRight: 20,
  },
  chart: {
    marginLeft: -15, // Align with Y-axis
    paddingTop: 10,
  },
});
