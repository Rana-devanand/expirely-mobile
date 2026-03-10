import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Platform,
} from "react-native";
import {
  TabView,
  SceneMap,
  NavigationState,
  SceneRendererProps,
} from "react-native-tab-view";
import {
  Home,
  BarChart3,
  Package,
  User,
  Plus,
  Sparkles,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../src/hooks/useAppTheme";

// Import screens
import HomeScreen from "./index";
import AnalyticsScreen from "./analytics";
import InventoryScreen from "./inventory";
import ProfileScreen from "./profile";
import AISmartHubScreen from "./aihub";

const renderScene = SceneMap({
  home: HomeScreen,
  inventory: InventoryScreen,
  aihub: AISmartHubScreen,
  stats: AnalyticsScreen,
  profile: ProfileScreen,
});

export default function TabLayout() {
  const layout = useWindowDimensions();
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const [index, setIndex] = useState(0);

  const routes = useMemo(
    () => [
      { key: "home", title: "Home", icon: Home },
      { key: "inventory", title: "Stock", icon: Package },
      { key: "aihub", title: "AI Hub", icon: Sparkles },
      { key: "stats", title: "Stats", icon: BarChart3 },
      { key: "profile", title: "Me", icon: User },
    ],
    [],
  );

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<any> },
  ) => {
    return (
      <View style={styles.tabBarWrapper}>
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: isDarkMode
                ? "rgba(30, 30, 30, 0.9)"
                : "rgba(255, 255, 255, 0.95)",
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Tab 0: Home */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setIndex(0)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                index === 0 && { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Home
                size={20}
                color={
                  index === 0
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                strokeWidth={index === 0 ? 2.5 : 2}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    index === 0
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Tab 1: Stock */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setIndex(1)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                index === 1 && { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Package
                size={20}
                color={
                  index === 1
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                strokeWidth={index === 1 ? 2.5 : 2}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    index === 1
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Stock
            </Text>
          </TouchableOpacity>

          {/* Tab 2: AI Hub */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setIndex(2)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                index === 2 && { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Sparkles
                size={20}
                color={
                  index === 2
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                strokeWidth={index === 2 ? 2.5 : 2}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    index === 2
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              AI Hub
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Stats */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setIndex(3)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                index === 3 && { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <BarChart3
                size={20}
                color={
                  index === 3
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                strokeWidth={index === 3 ? 2.5 : 2}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    index === 3
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Me */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setIndex(4)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                index === 4 && { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <User
                size={20}
                color={
                  index === 4
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                strokeWidth={index === 4 ? 2.5 : 2}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    index === 4
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Me
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Add Button - Shifted Above Right Side */}
        <TouchableOpacity
          style={[
            styles.floatingAddButton,
            {
              backgroundColor: theme.colors.primary,
              borderColor: isDarkMode ? "#121212" : "#FFFFFF",
            },
          ]}
          onPress={() => router.push("/addProduct")}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      tabBarPosition="bottom"
      renderTabBar={renderTabBar}
      swipeEnabled={true}
      animationEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 20,
    right: 20,
  },
  tabBar: {
    flexDirection: "row",
    height: 72,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  floatingAddButton: {
    position: "absolute",
    right: 15,
    top: -65,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
});
