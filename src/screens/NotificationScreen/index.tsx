import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState, AppDispatch } from "../../store";
import {
  fetchNotifications,
  markAsReadAsync,
  markAllAsReadAsync,
} from "../../store/notificationSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
} from "lucide-react-native";
import { getStyles } from "./styles";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { notifications, loading, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      dispatch(markAsReadAsync(id));
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllAsReadAsync());
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle2,
          color: "#10B981",
          bgColor: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "#ECFDF5",
        };
      case "warning":
        return {
          icon: AlertCircle,
          color: "#F59E0B",
          bgColor: isDarkMode ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB",
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "#EF4444",
          bgColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
        };
      default:
        return {
          icon: Info,
          color: "#3B82F6",
          bgColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
        };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const { icon: Icon, color, bgColor } = getIcon(item.type);

    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => handleMarkAsRead(item.id, item.is_read)}
        activeOpacity={0.7}
        disabled={loading}
      >
        {!item.is_read && <View style={styles.unreadIndicator} />}
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemMessage}>{item.message}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color={theme.colors.textSecondary} />
            <Text style={styles.timeText}>
              {dayjs(item.created_at).fromNow()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <ChevronLeft
              color={loading ? theme.colors.textSecondary : theme.colors.text}
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} disabled={loading}>
            <Text style={[styles.markAllText, loading && { opacity: 0.5 }]}>
              {loading ? "Loading..." : "Mark all as read"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(fetchNotifications())}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Bell size={64} color={theme.colors.border} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                We'll notify you when something important happens!
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginTop: 50 }}
            />
          )
        }
      />
    </View>
  );
}
