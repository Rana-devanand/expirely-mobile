import React, { useState, useMemo, useRef } from "react";
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
  Package,
  User,
  Plus,
  Sparkles,
  Scan,
  ShoppingCart,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../src/hooks/useAppTheme";

// Import screens
import HomeScreen from "./index";
import InventoryScreen from "./inventory";
import ProfileScreen from "./profile";
import AISmartHubScreen from "./aihub";
import ShoppingListScreen from "./shopping";

const renderScene = SceneMap({
  home: HomeScreen,
  inventory: InventoryScreen,
  shopping: ShoppingListScreen,
  aihub: AISmartHubScreen,
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
      { key: "shopping", title: "Shopping", icon: ShoppingCart },
      { key: "aihub", title: "AI Hub", icon: Sparkles },
      { key: "profile", title: "Me", icon: User },
    ],
    [],
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    if (toValue === 1) {
      setIsExpanded(true);
      Animated.spring(animation, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsExpanded(false);
      });
    }
  };

  const navigateTo = (route: any) => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsExpanded(false);
      router.push(route);
    });
  };

  const addTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });
  const scanTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -135],
  });
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

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
                : "rgba(253, 254, 252, 0.95)",
              borderColor: theme.colors.border,
            },
          ]}
        >
          {props.navigationState.routes.map((route, routeIndex) => {
            const Icon = route.icon;
            const isActive = index === routeIndex;

            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.tabItem,
                ]}
                onPress={() => setIndex(routeIndex)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isActive && {
                      backgroundColor: theme.colors.primary + "15",
                    },
                  ]}
                >
                  <Icon
                    size={20}
                    color={
                      isActive
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        tabBarPosition="bottom"
        renderTabBar={renderTabBar}
        swipeEnabled={!isExpanded}
        animationEnabled={true}
      />

      {/* Dim backdrop overlay for closing the FAB menu when clicking outside */}
      <Animated.View
        pointerEvents={isExpanded ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            opacity: backdropOpacity,
            zIndex: 99,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      </Animated.View>

      {/* Floating Action Menu Wrapper (Touch-safe parent that prevents boundary clipping) */}
      <View style={[styles.floatingMenuWrapper, { zIndex: 100 }]} pointerEvents="box-none">
        {/* Secondary Floating Menu Items */}
        {/* Add Product Option */}
        <Animated.View
          pointerEvents={isExpanded ? "auto" : "none"}
          style={[
            styles.secondaryButtonRow,
            {
              opacity: animation,
              transform: [{ translateY: addTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigateTo("/addProduct")}
            style={[
              styles.labelContainer,
              {
                backgroundColor: isDarkMode
                  ? "rgba(45, 45, 45, 0.95)"
                  : "rgba(253, 254, 252, 0.95)",
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              Add Product
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.primary,
                borderColor: isDarkMode ? "#121212" : theme.colors.card,
              },
            ]}
            onPress={() => navigateTo("/addProduct")}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </Animated.View>

        {/* Scan Barcode Option */}
        <Animated.View
          pointerEvents={isExpanded ? "auto" : "none"}
          style={[
            styles.secondaryButtonRow,
            {
              opacity: animation,
              transform: [{ translateY: scanTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigateTo("/scanner")}
            style={[
              styles.labelContainer,
              {
                backgroundColor: isDarkMode
                  ? "rgba(45, 45, 45, 0.95)"
                  : "rgba(253, 254, 252, 0.95)",
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.labelText, { color: theme.colors.text }]}>
              Scan Barcode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.primary,
                borderColor: isDarkMode ? "#121212" : theme.colors.card,
              },
            ]}
            onPress={() => navigateTo("/scanner")}
            activeOpacity={0.8}
          >
            <Scan size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

        {/* Floating Add Button - Shifted Above Right Side */}
        <TouchableOpacity
          style={[
            styles.floatingAddButton,
            {
              backgroundColor: theme.colors.primary,
              borderColor: isDarkMode ? "#121212" : theme.colors.card,
            },
          ]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Plus size={28} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
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
  floatingMenuWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 20,
    right: 20,
    height: 300,
    pointerEvents: "box-none",
  },
  floatingAddButton: {
    position: "absolute",
    right: 15,
    bottom: 77,
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
  secondaryButtonRow: {
    position: "absolute",
    right: 21,
    bottom: 83,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
  },
  labelContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
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
