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
import { useLocalSearchParams, useRouter } from "expo-router";
import { RootState, AppDispatch } from "../../store";
import { fetchProductsAsync, updateProductAsync, createProductAsync } from "../../store/productSlice";
import {
  fetchNotifications,
  markAsReadAsync,
  markAllAsReadAsync,
} from "../../store/notificationSlice";
import { fetchTemplatesAsync, trackTemplateUsageAsync } from "../../store/recurringSlice";
import { Product, RecurringProductTemplate } from "../../types";
import { toast } from "../../utils/toast";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getTimeBasedGreeting, formatRemainingTime } from "../../utils/dateHelpers";
import {
  Bell,
  Zap,
  ChevronRight,
  Scan,
  House,
  X,
  Plus,
  Minus,
  Calendar,
  AlertTriangle,
  RefreshCcw,
  Layers,
  Timer,
  Trash2,
  Thermometer,
  Snowflake,
  Package,
  Activity,
  HelpCircle,
} from "lucide-react-native";
import { Modal, ActivityIndicator, RefreshControl } from "react-native";
import { getStyles } from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateProductActions } from "../../utils/productActions";
import TodaysActions from "../../components/TodaysActions";
import { useGlobalModal } from "../../hooks/useGlobalModal";
import { addShoppingListItemAsync } from "../../store/shoppingSlice";
import { admobService } from "../../services/admobService";

dayjs.extend(relativeTime);

export default function HomeScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const { showModal } = useGlobalModal();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );
  const activeProducts = products.filter((p) => !p.isConsumed);
  const { unreadCount, notifications: realNotifications } = useSelector(
    (state: RootState) => state.notifications,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const { templates } = useSelector((state: RootState) => state.recurring);
  const styles = getStyles(theme, isDarkMode);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [allProductsFilter, setAllProductsFilter] = React.useState<
    "all" | "good" | "warning" | "expired"
  >("all");
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<RecurringProductTemplate | null>(null);
  const [quickAddModalVisible, setQuickAddModalVisible] = React.useState(false);
  const [quickAddQty, setQuickAddQty] = React.useState(1);
  const [quickAddShelfLife, setQuickAddShelfLife] = React.useState(7);
  const [quickAddLocation, setQuickAddLocation] = React.useState<"fridge" | "freezer" | "pantry" | "medicine_box" | "other">("other");
  const [isQuickAdding, setIsQuickAdding] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const [todaysActionsY, setTodaysActionsY] = React.useState(0);

  const loadDismissedActions = React.useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("@dismissed_actions");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading dismissed actions", e);
    }
  }, []);

  React.useEffect(() => {
    dispatch(fetchProductsAsync());
    dispatch(fetchNotifications());
    dispatch(fetchTemplatesAsync());
    loadDismissedActions();
  }, [dispatch, loadDismissedActions]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchProductsAsync()),
      dispatch(fetchNotifications()),
      dispatch(fetchTemplatesAsync()),
      loadDismissedActions(),
    ]);
    setRefreshing(false);
  }, [dispatch, loadDismissedActions]);

  const handleMarkUsed = React.useCallback(
    async (productId: string) => {
      try {
        const product = products.find((p) => p.id === productId);
        await dispatch(updateProductAsync({ id: productId, data: { isConsumed: true } })).unwrap();

        if (product) {
          showModal({
            title: "Add to Shopping List?",
            message: `Would you like to add "${product.name}" to your shopping list?`,
            confirmText: "Add",
            cancelText: "Cancel",
            type: "success",
            onConfirm: () => {
              dispatch(
                addShoppingListItemAsync({
                  name: product.name,
                  category: product.category,
                  qty: 1,
                })
              );
            },
          });
        }
      } catch (error) {
        console.error("Failed to mark product as used", error);
      }
    },
    [dispatch, products, showModal],
  );

  const handleDismissAction = React.useCallback(
    async (actionId: string) => {
      try {
        const updated = [...dismissedIds, actionId];
        setDismissedIds(updated);
        await AsyncStorage.setItem("@dismissed_actions", JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to dismiss action", error);
      }
    },
    [dismissedIds],
  );

  const handleViewProduct = React.useCallback(
    (productId: string) => {
      router.push({
        pathname: "/product/[id]",
        params: { id: productId },
      });
    },
    [router],
  );

  const handleStaplePress = React.useCallback(
    (item: RecurringProductTemplate) => {
      setSelectedTemplate(item);
      setQuickAddQty(item.default_qty || 1);
      setQuickAddShelfLife(item.default_shelf_life_days);
      setQuickAddLocation("other");
      setIsQuickAdding(false);
      setQuickAddModalVisible(true);
    },
    [],
  );

  const handleQuickAddConfirm = async () => {
    if (!selectedTemplate) return;

    const doSave = async () => {
      try {
        setIsQuickAdding(true);
        const calculatedExpiry = dayjs().add(quickAddShelfLife, "day").format("YYYY-MM-DD");
        await dispatch(
          createProductAsync({
            name: selectedTemplate.name,
            category: selectedTemplate.category,
            qty: quickAddQty,
            expiryDate: calculatedExpiry,
            storageLocation: quickAddLocation,
            imageUrl: selectedTemplate.image_url || "",
          })
        ).unwrap();

        await dispatch(trackTemplateUsageAsync(selectedTemplate.id)).unwrap();
        toast.success(`"${selectedTemplate.name}" added successfully!`);
        setQuickAddModalVisible(false);
        setSelectedTemplate(null);
      } catch (error: any) {
        console.error("Failed to quick add staple product", error);
        toast.error(error.message || "Failed to add staple product.");
      } finally {
        setIsQuickAdding(false);
      }
    };

    try {
      admobService.showInterstitialAd(doSave);
    } catch (adError) {
      console.warn("Failed to show AdMob Ad, saving immediately:", adError);
      await doSave();
    }
  };

  const handleQuickAddCustomize = () => {
    if (!selectedTemplate) return;
    const temp = selectedTemplate;
    setQuickAddModalVisible(false);
    setSelectedTemplate(null);
    router.push({
      pathname: "/addProduct",
      params: {
        templateId: temp.id,
        templateName: temp.name,
        templateCategory: temp.category,
        templateQty: quickAddQty.toString(),
        templateShelfLife: quickAddShelfLife.toString(),
        templateImageUrl: temp.image_url || "",
      },
    });
  };

  const productActions = generateProductActions(products, dismissedIds);

  React.useEffect(() => {
    if (focus !== "today-actions" || productActions.length === 0) return;

    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(todaysActionsY - 20, 0),
        animated: true,
      });
      router.replace("/");
    }, 350);

    return () => clearTimeout(timeout);
  }, [focus, productActions.length, todaysActionsY, router]);

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

  const getAllProductsRemainingLabel = React.useCallback((expiryDate: string) => {
    const compact = formatRemainingTime(expiryDate, false);

    if (compact === "Expired") return "Expired";
    if (compact.includes("left")) {
      return compact.replace("left", "remaining").trim();
    }

    return compact;
  }, []);

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

    if (variant === "default") {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.allProductShowcaseCard}
          activeOpacity={0.82}
          onPress={() =>
            router.push({
              pathname: "/product/[id]",
              params: { id: item.id },
            })
          }
        >
          <View
            style={[styles.allProductImageWrap, { backgroundColor: statusBg }]}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.allProductImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ fontSize: 34 }}>{getEmoji(item.category)}</Text>
            )}
          </View>

          <View style={styles.allProductContent}>
            <Text style={styles.allProductName} numberOfLines={2}>
              {item.name}
            </Text>

            <View style={styles.allProductMetaRow}>
              <Text style={styles.allProductMetaText} numberOfLines={1}>
                {item.category}
              </Text>
              <Text style={styles.allProductMetaDot}>|</Text>
              <Text
                style={[
                  styles.allProductMetaText,
                  { color: getZoneColor(item.storageLocation) },
                ]}
                numberOfLines={1}
              >
                {getZoneLabel(item.storageLocation)}
              </Text>
            </View>

            <View style={styles.allProductBottomRow}>
              <View style={styles.allProductTimeMeta}>
                <Timer size={14} color={theme.colors.textSecondary} />
                <Text style={styles.allProductTimeText} numberOfLines={1}>
                  {getAllProductsRemainingLabel(item.expiryDate)}
                </Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>
      );
    }

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Text style={[styles.recentCardCategory, { marginBottom: 0 }]} numberOfLines={1}>
            {item.category}
          </Text>
        </View>
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
        ref={scrollViewRef}
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
            <Text style={styles.appName}>Expirely</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push("/household")}
            >
              <House size={22} color={theme.colors.text} />
            </TouchableOpacity>
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
                {activeProducts.length > 0 ? activeProducts.length : "No"} active items
              </Text>
              <Text style={styles.heroSubtitle}>
                {totalCategories > 0 ? totalCategories : "No"} {totalCategories === 1 ? "category" : "categories"} tracked
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
            <Text style={styles.quickActionText}>Barcode</Text>
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

        <View onLayout={(event) => setTodaysActionsY(event.nativeEvent.layout.y)}>
          <TodaysActions
            actions={productActions}
            onMarkUsed={handleMarkUsed}
            onDismiss={handleDismissAction}
            onView={handleViewProduct}
          />
        </View>

        {/* Quick Add Staples Section */}
        {templates && templates.length > 0 && (
          <>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleCluster}>
                <Text style={styles.sectionTitle}>Quick Add Staples</Text>
                <View style={styles.sectionCountPill}>
                  <Text style={styles.sectionCountText}>{templates.length}</Text>
                </View>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.staplesScroll}
              style={styles.staplesList}
              nestedScrollEnabled={true}
              decelerationRate="fast"
              snapToInterval={142}
              snapToAlignment="start"
            >
              {templates.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.stapleCard}
                  activeOpacity={0.8}
                  onPress={() => handleStaplePress(item)}
                >
                  <View style={styles.stapleIconBg}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.stapleThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 24 }}>{getEmoji(item.category)}</Text>
                    )}
                  </View>
                  <Text style={styles.stapleName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.stapleFooter}>
                    <Text style={styles.stapleShelfLife}>
                      {item.default_shelf_life_days}d shelf
                    </Text>
                    {item.default_qty > 1 && (
                      <View style={styles.stapleQtyBadge}>
                        <Text style={styles.stapleQtyText}>x{item.default_qty}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

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
                {/* <View style={{ width: "100%", height: 1, backgroundColor: theme.colors.border, marginVertical: 2, marginBottom: 10 }} /> */}
                <FlatList
                  data={expiringSoon}
                  renderItem={renderExpiringItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.expiringList}
                  nestedScrollEnabled={true}
                  decelerationRate="fast"
                  snapToInterval={166}
                  snapToAlignment="start"
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
              nestedScrollEnabled={true}
              decelerationRate="fast"
              snapToInterval={176}
              snapToAlignment="start"
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
            <View style={{ width: "100%", height: 1, backgroundColor: theme.colors.border, marginVertical: 2, marginBottom: 10 }} />

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
        {/* Custom Quick Add Staple Modal */}
        <Modal
          visible={quickAddModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            if (isQuickAdding) return;
            setQuickAddModalVisible(false);
            setSelectedTemplate(null);
          }}
        >
          <View style={styles.quickAddModalOverlay}>
            <TouchableOpacity
              style={styles.quickAddModalBackdrop}
              activeOpacity={1}
              onPress={() => {
                if (isQuickAdding) return;
                setQuickAddModalVisible(false);
                setSelectedTemplate(null);
              }}
            />
            <View style={styles.quickAddModalContent}>
              {selectedTemplate && (
                <>
                  <View style={styles.quickAddModalHeader}>
                    <Text style={styles.quickAddModalTitle}>Quick Add Staple</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setQuickAddModalVisible(false);
                        setSelectedTemplate(null);
                      }}
                      style={[styles.quickAddCloseBtn, isQuickAdding && { opacity: 0.3 }]}
                      disabled={isQuickAdding}
                    >
                      <X size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quickAddModalHero}>
                    <View style={styles.quickAddEmojiContainer}>
                      {selectedTemplate.image_url ? (
                        <Image
                          source={{ uri: selectedTemplate.image_url }}
                          style={styles.quickAddHeroImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={{ fontSize: 36 }}>{getEmoji(selectedTemplate.category)}</Text>
                      )}
                    </View>
                    <Text style={styles.quickAddTemplateName}>{selectedTemplate.name}</Text>
                    <Text style={styles.quickAddTemplateCategory}>{selectedTemplate.category}</Text>
                  </View>

                  {/* Quantity adjustment */}
                  <View style={styles.quickAddModalRow}>
                    <View>
                      <Text style={styles.quickAddRowLabel}>Quantity</Text>
                      <Text style={styles.quickAddRowSub}>How many units?</Text>
                    </View>
                    <View style={[styles.quickAddQtySelector, isQuickAdding && { opacity: 0.5 }]}>
                      <TouchableOpacity
                        style={styles.quickAddQtyBtn}
                        onPress={() => setQuickAddQty(Math.max(1, quickAddQty - 1))}
                        disabled={isQuickAdding}
                      >
                        <Minus size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.quickAddQtyText}>{quickAddQty}</Text>
                      <TouchableOpacity
                        style={styles.quickAddQtyBtn}
                        onPress={() => setQuickAddQty(quickAddQty + 1)}
                        disabled={isQuickAdding}
                      >
                        <Plus size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Shelf life days adjustment */}
                  <View style={styles.quickAddModalRow}>
                    <View>
                      <Text style={styles.quickAddRowLabel}>Shelf Life</Text>
                      <Text style={styles.quickAddRowSub}>
                        Expires: {dayjs().add(quickAddShelfLife, "day").format("MMM D, YYYY")}
                      </Text>
                    </View>
                    <View style={[styles.quickAddQtySelector, isQuickAdding && { opacity: 0.5 }]}>
                      <TouchableOpacity
                        style={styles.quickAddQtyBtn}
                        onPress={() => setQuickAddShelfLife(Math.max(1, quickAddShelfLife - 1))}
                        disabled={isQuickAdding}
                      >
                        <Minus size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.quickAddQtyText}>{quickAddShelfLife}d</Text>
                      <TouchableOpacity
                        style={styles.quickAddQtyBtn}
                        onPress={() => setQuickAddShelfLife(quickAddShelfLife + 1)}
                        disabled={isQuickAdding}
                      >
                        <Plus size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Storage Location selector */}
                  <View style={styles.quickAddLocationSection}>
                    <Text style={styles.quickAddLocationLabel}>Storage Zone</Text>
                    <View style={styles.quickAddLocationChips}>
                      {[
                        { value: "fridge", label: "Fridge", icon: Thermometer, color: "#3B82F6" },
                        { value: "freezer", label: "Freezer", icon: Snowflake, color: "#06B6D4" },
                        { value: "pantry", label: "Pantry", icon: Package, color: "#F59E0B" },
                        { value: "medicine_box", label: "Medicine", icon: Activity, color: "#10B981" },
                        { value: "other", label: "Other", icon: HelpCircle, color: "#64748B" },
                      ].map((zone) => {
                        const isSelected = quickAddLocation === zone.value;
                        const Icon = zone.icon;
                        return (
                          <TouchableOpacity
                            key={zone.value}
                            style={[
                              styles.quickAddZoneChip,
                              isSelected && { borderColor: zone.color, backgroundColor: zone.color + "14" },
                              isQuickAdding && { opacity: 0.5 },
                            ]}
                            onPress={() => setQuickAddLocation(zone.value as any)}
                            disabled={isQuickAdding}
                          >
                            <Icon size={12} color={isSelected ? zone.color : theme.colors.textSecondary} />
                            <Text
                              style={[
                                styles.quickAddZoneChipText,
                                isSelected && { color: zone.color, fontWeight: "900" },
                              ]}
                            >
                              {zone.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.quickAddModalActions}>
                    <TouchableOpacity
                      style={[styles.quickAddCustomizeBtn, isQuickAdding && { opacity: 0.5 }]}
                      onPress={handleQuickAddCustomize}
                      disabled={isQuickAdding}
                    >
                      <Text style={styles.quickAddCustomizeBtnText}>Customize</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickAddPrimaryBtn, isQuickAdding && { opacity: 0.8 }]}
                      onPress={handleQuickAddConfirm}
                      disabled={isQuickAdding}
                    >
                      {isQuickAdding ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.quickAddPrimaryBtnText}>Quick Add</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const getZoneColor = (zone?: string) => {
  switch (zone) {
    case "fridge":
      return "#3B82F6";
    case "freezer":
      return "#06B6D4";
    case "pantry":
      return "#F59E0B";
    case "medicine_box":
      return "#10B981";
    case "other":
    default:
      return "#64748B";
  }
};

const getZoneLabel = (zone?: string) => {
  switch (zone) {
    case "fridge":
      return "Fridge";
    case "freezer":
      return "Freezer";
    case "pantry":
      return "Pantry";
    case "medicine_box":
      return "Med";
    case "other":
    default:
      return "Other";
  }
};

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
