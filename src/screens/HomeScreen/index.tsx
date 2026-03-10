import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState, AppDispatch } from "../../store";
import { fetchProductsAsync } from "../../store/productSlice";
import {
  fetchNotifications,
  markAsReadAsync,
  markAllAsReadAsync,
} from "../../store/notificationSlice";
import { Product } from "../../types";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getTimeBasedGreeting } from "../../utils/dateHelpers";
import {
  Search,
  Bell,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Scan,
  X,
  Plus,
  Info,
  AlertTriangle,
  RefreshCcw,
  Layers,
  CalendarX,
} from "lucide-react-native";
import { Modal, ActivityIndicator, RefreshControl } from "react-native";
import { getStyles } from "./styles";
import ExpiryTrendsGraph from "../../components/ExpiryTrendsGraph";

dayjs.extend(relativeTime);

export default function HomeScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );
  const activeProducts = products.filter((p) => !p.isConsumed);
  const { unreadCount, notifications: realNotifications } = useSelector(
    (state: RootState) => state.notifications,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const styles = getStyles(theme, isDarkMode);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchProductsAsync());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchProductsAsync()),
      dispatch(fetchNotifications()),
    ]);
    setRefreshing(false);
  }, [dispatch]);

  const notifications = [
    {
      id: "1",
      title: "Expiry Alert",
      description: "Your Organic Milk should be expire in 2 days.",
      type: "warning",
      time: "5h ago",
      unread: true,
      category: "dairy",
    },
    {
      id: "2",
      title: "Product Added",
      description:
        "Fresh Strawberries has been successfully added to your inventory.",
      type: "success",
      time: "7h ago",
      unread: false,
      category: "fruit",
    },
    {
      id: "3",
      title: "Lease Renewal Reminder",
      description:
        "Your Greek Yogurt is set to expire on October 15, 2023. consumed it.",
      type: "error",
      time: "7h ago",
      unread: false,
      category: "dairy",
    },
  ];

  const expiringSoon = activeProducts.filter((p) => p.status === "warning");
  const recentlyAdded = activeProducts.slice(-3).reverse();
  const allProducts = activeProducts.slice(0, 5); // Display first 5 for "All Products" section

  const expiredCount = activeProducts.filter(
    (p) => p.status === "expired",
  ).length;
  const warningCount = activeProducts.filter(
    (p) => p.status === "warning",
  ).length;
  const goodCount = activeProducts.filter((p) => p.status === "good").length;

  const totalCategories = new Set(activeProducts.map((p) => p.category)).size;

  const renderDescription = (desc: string) => {
    // Basic keyword highlighting logic
    const keywords = [
      "expire",
      "successfully",
      "added",
      "2 days",
      "October 15, 2023",
      "Organic Milk",
      "Fresh Strawberries",
      "Greek Yogurt",
    ];
    const regex = new RegExp(`(${keywords.join("|")})`, "gi");
    const parts = desc.split(regex);

    return (
      <Text style={styles.notifDesc}>
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          if (lowerPart === "expire")
            return (
              <Text key={i} style={styles.errorKeyword}>
                {part}
              </Text>
            );
          if (lowerPart === "successfully")
            return (
              <Text key={i} style={styles.successKeyword}>
                {part}
              </Text>
            );
          if (keywords.map((k) => k.toLowerCase()).includes(lowerPart))
            return (
              <Text key={i} style={styles.boldKeyword}>
                {part}
              </Text>
            );
          return part;
        })}
      </Text>
    );
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <View style={[styles.notificationItem, item.unread && styles.unreadItem]}>
      <View style={styles.notifIconContainer}>
        <Text style={{ fontSize: 24 }}>{getEmoji(item.category || "")}</Text>
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <View style={styles.notifTitleContainer}>
            {item.unread && <View style={styles.statusDot} />}
            <Text style={styles.notifTitle}>{item.title}</Text>
          </View>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        {renderDescription(item.description)}
      </View>
    </View>
  );

  const renderExpiringItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.expiringCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/product/[id]",
          params: { id: item.id },
        })
      }
    >
      <View
        style={[
          styles.itemIconBg,
          { backgroundColor: theme.colors.expiringBg },
        ]}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: "100%", borderRadius: 20 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 28 }}>{getEmoji(item.category)}</Text>
        )}
      </View>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.itemCategory}>{item.category}</Text>
      <View
        style={[styles.daysBadge, { backgroundColor: theme.colors.expiringBg }]}
      >
        <Text style={[styles.daysText, { color: theme.colors.error }]}>
          {item.daysLeft}d left
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = (item: Product) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/product/[id]",
          params: { id: item.id },
        })
      }
    >
      <View
        style={[
          styles.iconBg,
          {
            backgroundColor:
              item.status === "expired"
                ? theme.colors.expiredBg
                : theme.colors.freshBg,
          },
        ]}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: "100%", borderRadius: 15 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 24 }}>{getEmoji(item.category)}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              item.status === "expired"
                ? theme.colors.expiredBg
                : theme.colors.freshBg,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color:
                item.status === "expired"
                  ? theme.colors.textSecondary
                  : theme.colors.success,
            },
          ]}
        >
          {item.daysLeft}d
        </Text>
      </View>
      <ChevronRight
        size={20}
        color={theme.colors.border}
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getTimeBasedGreeting()} 👋</Text>
            <Text style={styles.appName}>{user?.username || "Friend"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push("/scanner")}
            >
              <Scan size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => setShowNotifications(true)}
            >
              <View>
                <Bell size={22} color={theme.colors.text} />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: theme.colors.error,
                      borderWidth: 2,
                      borderColor: theme.colors.card,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal for Notifications */}
        <Modal
          visible={showNotifications}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={28} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => dispatch(markAllAsReadAsync())}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Recent</Text>
              </View>

              {realNotifications.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    if (!item.is_read) dispatch(markAsReadAsync(item.id));
                  }}
                >
                  {renderNotificationItem({
                    item: {
                      ...item,
                      description: item.message,
                      time: dayjs(item.created_at).fromNow(),
                      unread: !item.is_read,
                    },
                  })}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.modalFooter}
                onPress={() => {
                  setShowNotifications(false);
                  router.push("/notifications");
                }}
              >
                <Text style={styles.footerText}>View all notifications</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Storage Overview Card */}
        <View style={styles.inventoryBanner}>
          <View style={styles.inventoryInfo}>
            <Text style={styles.inventoryTitle}>Storage Overview</Text>
            <Text style={styles.inventoryCount}>
              {activeProducts.length}{" "}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.textSecondary,
                }}
              >
                Items
              </Text>
              {"  "}
              <Text style={{ fontSize: 24, color: theme.colors.border }}>
                |
              </Text>
              {"  "}
              {totalCategories}{" "}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.colors.textSecondary,
                }}
              >
                Category
              </Text>
            </Text>
          </View>
          <View style={styles.inventoryIconContainer}>
            <Layers size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* Improved Stats Grid */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.expiringBg },
            ]}
          >
            <View style={styles.statIconContainer}>
              <AlertTriangle size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
              {warningCount}
            </Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.colors.freshBg }]}
          >
            <View style={styles.statIconContainer}>
              <CheckCircle2 size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>
              {goodCount}
            </Text>
            <Text style={styles.statLabel}>Fresh</Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.expiredBg },
            ]}
          >
            <View style={styles.statIconContainer}>
              <CalendarX size={24} color={theme.colors.textSecondary} />
            </View>
            <Text
              style={[styles.statNumber, { color: theme.colors.textSecondary }]}
            >
              {expiredCount}
            </Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        {/* Conditionally Render Sections or Empty State */}
        {loading && activeProducts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={{
                marginTop: 10,
                color: theme.colors.textSecondary,
              }}
            >
              Loading your inventory...
            </Text>
          </View>
        ) : activeProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Zap size={48} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Your inventory is empty</Text>
            <Text style={styles.emptySubtitle}>
              You haven't added any products yet. Start tracking your items to
              avoid expiry waste!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={() => router.push("/addProduct")}
            >
              <Plus size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Expiry Trends Graph with Real Data */}
            <ExpiryTrendsGraph products={activeProducts} />

            {/* Expiring Soon Section */}
            {expiringSoon.length > 0 && (
              <>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Expiring Soon</Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/product-list",
                        params: { type: "expiring", title: "Expiring Soon" },
                      })
                    }
                  >
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={expiringSoon}
                  renderItem={renderExpiringItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.expiringList}
                />
              </>
            )}

            {/* All Products Section */}
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>All Products</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/product-list",
                    params: { type: "all", title: "All Products" },
                  })
                }
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.verticalList}>
              {allProducts.map((item) => renderProductItem(item))}
            </View>

            {/* Recently Added Section */}
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Recently Added</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/product-list",
                    params: { type: "recent", title: "Recently Added" },
                  })
                }
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.verticalList}>
              {recentlyAdded.map((item) => renderProductItem(item))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getEmoji = (category: string) => {
  switch (category.toLowerCase()) {
    case "dairy":
      return "🥛";
    case "fruit":
      return "🍓";
    case "meat":
      return "🍗";
    case "beverage":
      return "🧃";
    case "bakery":
      return "🍞";
    case "vegetables":
      return "🥦";
    default:
      return "📦";
  }
};
