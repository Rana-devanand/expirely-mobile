import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DimensionValue,
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
import { getTimeBasedGreeting, formatRemainingTime } from "../../utils/dateHelpers";
import {
  Bell,
  Zap,
  ChevronRight,
  Scan,
  X,
  Plus,
  Calendar,
  AlertTriangle,
  RefreshCcw,
  Layers,
  Timer,
  Apple,
  Trash2,
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
  const [allProductsFilter, setAllProductsFilter] = React.useState<
    "all" | "good" | "warning" | "expired"
  >("all");

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

  const expiringSoon = activeProducts.filter((p) => p.status === "warning");
  const recentlyAdded = activeProducts.slice(-3).reverse();

  const expiredCount = activeProducts.filter(
    (p) => p.status === "expired",
  ).length;
  const warningCount = activeProducts.filter(
    (p) => p.status === "warning",
  ).length;
  const goodCount = activeProducts.filter((p) => p.status === "good").length;

  const totalCategories = new Set(activeProducts.map((p) => p.category)).size;
  const nextExpiry = [...activeProducts]
    .filter((p) => p.expiryDate)
    .sort((a, b) => dayjs(a.expiryDate).diff(dayjs(b.expiryDate)))[0];
  const allProductFilterOptions = [
    { key: "all", label: "All", count: activeProducts.length },
    { key: "good", label: "Fresh", count: goodCount },
    { key: "warning", label: "Soon", count: warningCount },
    { key: "expired", label: "Expired", count: expiredCount },
  ] as const;
  const allProducts =
    allProductsFilter === "all"
      ? activeProducts.slice(0, 5)
      : activeProducts
        .filter((product) => product.status === allProductsFilter)
        .slice(0, 5);

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
          {formatRemainingTime(item.expiryDate, false)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = (
    item: Product,
    variant: "default" | "recent" = "default",
  ) => {
    const statusColor =
      item.status === "expired"
        ? theme.colors.error
        : item.status === "warning"
          ? theme.colors.warning
          : theme.colors.success;
    const statusBg =
      item.status === "expired"
        ? theme.colors.expiredBg
        : item.status === "warning"
          ? theme.colors.expiringBg
          : theme.colors.freshBg;
    const createdLabel = item.created_at
      ? dayjs(item.created_at).fromNow()
      : "Recently tracked";
    const progressWidth = `${Math.max(
      8,
      Math.min(100, ((item.daysLeft || 0) / 30) * 100),
    )}%` as DimensionValue;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.itemCard,
          variant === "recent" && styles.recentItemCard,
        ]}
        activeOpacity={0.82}
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.id },
          })
        }
      >
        <View
          style={[styles.itemStatusStrip, { backgroundColor: statusColor }]}
        />
        <View style={[styles.iconBg, { backgroundColor: statusBg }]}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productThumb}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 24 }}>{getEmoji(item.category)}</Text>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.productTopRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {variant === "recent" && (
              <Text style={styles.recentLabel} numberOfLines={1}>
                {createdLabel}
              </Text>
            )}
          </View>

          <View style={styles.productMetaRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.category} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
            <View style={styles.dateMeta}>
              <Calendar size={12} color={theme.colors.textSecondary} />
              <Text style={styles.dateMetaText} numberOfLines={1}>
                {dayjs(item.expiryDate).format("MMM D")}
              </Text>
            </View>
            {(item.qty || 0) > 1 && (
              <View style={styles.qtyPill}>
                <Text style={styles.qtyPillText}>x{item.qty}</Text>
              </View>
            )}
          </View>
         
        </View>

        <View style={styles.rightMeta}>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {formatRemainingTime(item.expiryDate, true)}
            </Text>
          </View>
          <View style={styles.rowChevron}>
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentProductCard = (item: Product) => {
    const statusColor =
      item.status === "expired"
        ? theme.colors.error
        : item.status === "warning"
          ? theme.colors.warning
          : theme.colors.success;
    const statusBg =
      item.status === "expired"
        ? theme.colors.expiredBg
        : item.status === "warning"
          ? theme.colors.expiringBg
          : theme.colors.freshBg;
    const createdLabel = item.created_at
      ? dayjs(item.created_at).fromNow()
      : "New item";

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.recentProductCard}
        activeOpacity={0.84}
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={[styles.recentImageWrap, { backgroundColor: statusBg }]}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.recentProductImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 34 }}>{getEmoji(item.category)}</Text>
          )}
          <View style={[styles.recentStatusDot, { backgroundColor: statusColor }]} />
        </View>
        <Text style={styles.recentCardName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.recentCardCategory} numberOfLines={1}>
          {item.category}
        </Text>
        <View style={styles.recentCardFooter}>
          <Text style={styles.recentCardTime} numberOfLines={1}>
            {createdLabel}
          </Text>
          <View style={[styles.recentExpiryBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.recentExpiryText, { color: statusColor }]}>
              {formatRemainingTime(item.expiryDate, true)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

        {/* Dashboard Overview */}
        <View style={styles.dashboardHero}>


          <View style={styles.heroMainRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Dashboard</Text>
              <Text style={styles.heroTitle}>
                {activeProducts.length} active items
              </Text>
              <Text style={styles.heroSubtitle}>
                {totalCategories} {totalCategories === 1 ? "category" : "categories"} tracked
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Layers size={30} color={theme.colors.primary} />
            </View>
          </View>

          <View style={styles.heroHealthRow}>
            <View style={styles.heroHealthItem}>
              <Text style={[styles.heroHealthValue, { color: theme.colors.success }]}>
                {goodCount}
              </Text>
              <Text style={styles.heroHealthLabel}>Fresh</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroHealthItem}>
              <Text style={[styles.heroHealthValue, { color: theme.colors.warning }]}>
                {warningCount}
              </Text>
              <Text style={styles.heroHealthLabel}>Soon</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroHealthItem}>
              <Text style={[styles.heroHealthValue, { color: theme.colors.error }]}>
                {expiredCount}
              </Text>
              <Text style={styles.heroHealthLabel}>Expired</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() => router.push("/addProduct")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primary + "18" }]}>
              <Plus size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Add item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() => router.push("/scanner")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: "#EFF6FF" }]}>
              <Scan size={18} color="#2563EB" />
            </View>
            <Text style={styles.quickActionText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/product-list",
                params: { type: "expiring", title: "Expiring Soon" },
              })
            }
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.expiringBg }]}>
              <AlertTriangle size={18} color={theme.colors.warning} />
            </View>
            <Text style={styles.quickActionText}>Review</Text>
          </TouchableOpacity>
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
            {/* <ExpiryTrendsGraph products={activeProducts} /> */}

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

            {/* Recently Added Section */}
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleCluster}>
                <Text style={styles.sectionTitle}>Recently Added</Text>
                <View style={styles.sectionCountPill}>
                  <Text style={styles.sectionCountText}>
                    {recentlyAdded.length}
                  </Text>
                </View>
              </View>
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentProductsRow}
            >
              {recentlyAdded.map((item) => renderRecentProductCard(item))}
            </ScrollView>


            {/* All Products Section */}
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleCluster}>
                <Text style={styles.sectionTitle}>All Products</Text>
                <View style={styles.sectionCountPill}>
                  <Text style={styles.sectionCountText}>
                    {allProductFilterOptions.find(
                      (option) => option.key === allProductsFilter,
                    )?.count || 0}
                  </Text>
                </View>
              </View>
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productFilterRow}
            >
              {allProductFilterOptions.map((option) => {
                const isActive = allProductsFilter === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.productFilterChip,
                      isActive && styles.activeProductFilterChip,
                    ]}
                    activeOpacity={0.78}
                    onPress={() => setAllProductsFilter(option.key)}
                  >
                    <Text
                      style={[
                        styles.productFilterText,
                        isActive && styles.activeProductFilterText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View
                      style={[
                        styles.filterCountBadge,
                        isActive && styles.activeFilterCountBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountText,
                          isActive && styles.activeFilterCountText,
                        ]}
                      >
                        {option.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {allProducts.length > 0 ? (
              <View style={styles.verticalList}>
                {allProducts.map((item) => renderProductItem(item))}
              </View>
            ) : (
              <View style={styles.inlineEmptyState}>
                <AlertTriangle size={20} color={theme.colors.textSecondary} />
                <Text style={styles.inlineEmptyTitle}>No matching products</Text>
                <Text style={styles.inlineEmptyText}>
                  Try another filter or add more inventory items.
                </Text>
              </View>
            )}
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
