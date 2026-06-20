import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import PieChart from "react-native-chart-kit/dist/PieChart";
import dayjs from "dayjs";
import { useAppTheme } from "../hooks/useAppTheme";
import { Product } from "../types";

const chartWidth = Dimensions.get("window").width - 64;

interface Props {
  products: Product[];
}

export default function ExpiryTrendsGraph({ products }: Props) {
  const { theme, isDarkMode } = useAppTheme();

  const breakdown = products.reduce(
    (acc, product) => {
      const daysToExpiry = dayjs(product.expiryDate)
        .startOf("day")
        .diff(dayjs().startOf("day"), "day");

      if (daysToExpiry < 0) acc.expired += 1;
      else if (daysToExpiry <= 3) acc.urgent += 1;
      else if (daysToExpiry <= 10) acc.soon += 1;
      else acc.safe += 1;

      return acc;
    },
    { expired: 0, urgent: 0, soon: 0, safe: 0 },
  );

  const total = products.length;
  const summaryRows = [
    {
      label: "Expired",
      value: breakdown.expired,
      color: theme.colors.error,
      helper: "Needs cleanup",
    },
    {
      label: "0-3 days",
      value: breakdown.urgent,
      color: theme.colors.warning,
      helper: "Use first",
    },
    {
      label: "4-10 days",
      value: breakdown.soon,
      color: "#60A5FA",
      helper: "Plan meals",
    },
    {
      label: "Safe",
      value: breakdown.safe,
      color: theme.colors.success,
      helper: "Healthy stock",
    },
  ];

  const chartData = summaryRows
    .filter((item) => item.value > 0)
    .map((item) => ({
      name: item.label,
      population: item.value,
      color: item.color,
      legendFontColor: theme.colors.textSecondary,
      legendFontSize: 11,
    }));

  const visibleChartData =
    chartData.length > 0
      ? chartData
      : [
          {
            name: "No items",
            population: 1,
            color: theme.colors.border,
            legendFontColor: theme.colors.textSecondary,
            legendFontSize: 11,
          },
        ];

  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) =>
      isDarkMode
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(15, 23, 42, ${opacity})`,
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
            Expiry Risk
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Inventory grouped by urgency
          </Text>
        </View>
        <View
          style={[
            styles.totalPill,
            {
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.06)"
                : "#EFF7F2",
            },
          ]}
        >
          <Text style={[styles.totalValue, { color: theme.colors.text }]}>
            {total}
          </Text>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
            items
          </Text>
        </View>
      </View>

      <View style={styles.chartWrap}>
        <PieChart
          data={visibleChartData}
          width={chartWidth}
          height={172}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          center={[8, 0]}
          absolute
          hasLegend={false}
        />
        <View
          style={[
            styles.centerMetric,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.centerValue, { color: theme.colors.text }]}>
            {total}
          </Text>
          <Text style={[styles.centerLabel, { color: theme.colors.textSecondary }]}>
            tracked
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        {summaryRows.map((row) => (
          <View
            key={row.label}
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.04)"
                  : "#F7FCF9",
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryTopRow}>
              <View style={[styles.dot, { backgroundColor: row.color }]} />
              <Text style={[styles.summaryValue, { color: row.color }]}>
                {row.value}
              </Text>
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
              {row.label}
            </Text>
            <Text
              style={[
                styles.summaryHelper,
                { color: theme.colors.textSecondary },
              ]}
            >
              {row.helper}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
  totalPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  chartWrap: {
    minHeight: 172,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  centerMetric: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  centerValue: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    width: "48.3%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2,
  },
  summaryHelper: {
    fontSize: 11,
    fontWeight: "600",
  },
});
