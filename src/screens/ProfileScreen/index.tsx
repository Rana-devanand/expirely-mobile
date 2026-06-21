import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../../store/uiSlice";
import { logoutUser, updateReminderSettingsAsync } from "../../store/authSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import { RootState } from "../../store";
import {
  User,
  Lock,
  Bell,
  Shield,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Package,
  Trash2,
  MessageSquare,
  Users,
  Clock3,
} from "lucide-react-native";
import { getStyles } from "./styles";
import { useRouter } from "expo-router";
import { getInitials } from "../../utils/stringUtils";
import { useGlobalModal } from "../../hooks/useGlobalModal";
import { adminService } from "../../services/adminService";
import { api } from "../../services/api";
import { storage } from "../../services/storage";
import { userService } from "../../services/user";

const formatReminderTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();

  const [adminStats, setAdminStats] = useState<{ totalUsers: number; totalProducts: number } | null>(null);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(
    Boolean(user?.daily_reminder_enabled),
  );
  const [dailyReminderTime, setDailyReminderTime] = useState(
    user?.daily_reminder_time || "20:00",
  );
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [isReminderSaving, setIsReminderSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      const fetchStats = async () => {
        try {
          const stats = await adminService.getStats();
          setAdminStats(stats);
        } catch (error) {
          console.error("Failed to load admin stats:", error);
        }
      };
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    setDailyReminderEnabled(Boolean(user?.daily_reminder_enabled));
    setDailyReminderTime(user?.daily_reminder_time || "20:00");
  }, [user?.daily_reminder_enabled, user?.daily_reminder_time]);

  useEffect(() => {
    const loadReminderSettings = async () => {
      try {
        const response = await userService.getReminderSettings();
        if (response.success) {
          setDailyReminderEnabled(response.data.dailyReminderEnabled);
          setDailyReminderTime(response.data.dailyReminderTime || "20:00");
        }
      } catch (error) {
        console.warn("Failed to load reminder settings", error);
      }
    };

    loadReminderSettings();
  }, []);

  const menuItems = [
    {
      id: "edit",
      label: "Edit Profile",
      icon: User,
      color: "#EFF6FF",
      iconColor: "#3B82F6",
    },
    {
      id: "password",
      label: "Change Password",
      icon: Lock,
      color: "#FDF2F8",
      iconColor: "#EC4899",
      hidden: user?.auth_provider !== "local",
    },
    {
      id: "household",
      label: "Family Household",
      icon: Users,
      color: "#EFF7FF",
      iconColor: "#6366F1",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "#F5F3FF",
      iconColor: "#8B5CF6",
    },
    {
      id: "feedback",
      label: "Send Feedback",
      icon: MessageSquare,
      color: "#ECFDF5",
      iconColor: "#10B981",
    },
    {
      id: "delete",
      label: "Delete Account",
      icon: Trash2,
      color: "#FEF2F2",
      iconColor: "#EF4444",
    },
  ].filter((item) => !item.hidden);
  const { showModal } = useGlobalModal();

  const handleLogout = () => {
    showModal({
      title: "Logout Confirmation",
      message: "Are you sure you want to log out of your account?",
      confirmText: "Logout",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        dispatch(logoutUser() as any);
        router.replace("/login");
      },
    });
  };

  const handleDeleteAccount = () => {
    showModal({
      title: "⚠️ Delete Account Permanently",
      message:
        "Are you sure you want to permanently delete your account? This action is irreversible. All your inventory products, expiration alerts, notifications, and profile details will be permanently deleted from our servers.",
      confirmText: "Delete Permanently",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          // 1. Call delete account API
          await api.delete("/users/profile");
          // 2. Perform logout cleanup
          dispatch(logoutUser() as any);
          router.replace("/login");
        } catch (error: any) {
          console.error("Account deletion failed:", error);
          showModal({
            title: "Delete failed",
            message:
              error.message || "Failed to delete account. Please try again.",
            confirmText: "OK",
            hideCancel: true,
            type: "danger",
            onConfirm: () => {},
          });
        }
      },
    });
  };

  const saveReminderSettings = async (
    enabled: boolean,
    time: string,
    showSuccessAlert = false,
  ) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setIsReminderSaving(true);
    try {
      await dispatch(
        updateReminderSettingsAsync({
          dailyReminderEnabled: enabled,
          dailyReminderTime: time,
          timezone,
        }) as any,
      ).unwrap();

      setDailyReminderEnabled(enabled);
      setDailyReminderTime(time);

      if (showSuccessAlert) {
        showModal({
          title: "Reminder updated",
          message: enabled
            ? `Daily reminders are on for ${formatReminderTime(time)}.`
            : "Daily reminders are turned off.",
          confirmText: "OK",
          hideCancel: true,
          type: "success",
          onConfirm: () => {},
        });
      }
      return true;
    } catch (error: any) {
      showModal({
        title: "Reminder update failed",
        message: error?.message || "We couldn't save your reminder settings.",
        confirmText: "OK",
        hideCancel: true,
        type: "danger",
        onConfirm: () => {},
      });
      return false;
    } finally {
      setIsReminderSaving(false);
    }
  };

  const handleReminderToggle = async (value: boolean) => {
    const previousValue = dailyReminderEnabled;
    setDailyReminderEnabled(value);
    const success = await saveReminderSettings(value, dailyReminderTime, true);
    if (!success) {
      setDailyReminderEnabled(previousValue);
    }
  };

  const handleReminderTimeConfirm = async (date: Date) => {
    const previousTime = dailyReminderTime;
    setShowReminderTimePicker(false);
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;
    setDailyReminderTime(formattedTime);
    const success = await saveReminderSettings(
      dailyReminderEnabled,
      formattedTime,
      true,
    );
    if (!success) {
      setDailyReminderTime(previousTime);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitials}>
                  {getInitials(user?.username || "")}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.userName}>{user?.username || "Guest User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "guest@example.com"}
          </Text>
        </View>

        <View style={styles.sectionWrapper}>
          {user?.role === "ADMIN" && (
            <>
              <Text style={styles.sectionLabel}>Admin Dashboard</Text>
              <View style={styles.adminDashboardContainer}>
                {/* Card 1: Total Users */}
                <TouchableOpacity
                  style={[
                    styles.adminCard,
                    {
                      backgroundColor: isDarkMode ? "#1E1E1E" : theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => router.push("/admin/users")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.adminCardIconBox, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
                    <User size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.adminCardInfo}>
                    <Text style={[styles.adminCardNumber, { color: theme.colors.text }]}>
                      {adminStats ? adminStats.totalUsers : "-"}
                    </Text>
                    <Text style={[styles.adminCardLabel, { color: theme.colors.textSecondary }]}>
                      Total Users
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Card 2: Total Products */}
                <TouchableOpacity
                  style={[
                    styles.adminCard,
                    {
                      backgroundColor: isDarkMode ? "#1E1E1E" : theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => router.push("/admin/products")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.adminCardIconBox, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                    <Package size={24} color="#10B981" />
                  </View>
                  <View style={styles.adminCardInfo}>
                    <Text style={[styles.adminCardNumber, { color: theme.colors.text }]}>
                      {adminStats ? adminStats.totalProducts : "-"}
                    </Text>
                    <Text style={[styles.adminCardLabel, { color: theme.colors.textSecondary }]}>
                      Total Products
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Admin Actions Group */}
              <View style={[styles.menuGroup, { marginBottom: 24 }]}>
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => router.push("/admin/logs")}
                >
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(139, 92, 246, 0.15)"
                          : "#F5F3FF",
                      },
                    ]}
                  >
                    <Shield size={20} color={isDarkMode ? "#A78BFA" : "#8B5CF6"} />
                  </View>
                  <Text style={styles.menuText}>System Activity Logs</Text>
                  <ChevronRight size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>General</Text>
          <View style={styles.reminderCard}>
            <View style={styles.reminderRow}>
              <View style={[styles.iconBox, styles.reminderIconBox]}>
                <Bell size={20} color={isDarkMode ? "#A78BFA" : "#8B5CF6"} />
              </View>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>Daily Reminder</Text>
                <Text style={styles.reminderSubtext}>
                  Get one helpful reminder for items that need attention.
                </Text>
              </View>
              <Switch
                value={dailyReminderEnabled}
                onValueChange={handleReminderToggle}
                disabled={isReminderSaving}
                trackColor={{ false: "#CBD5E1", true: "#8B5CF6" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.timeButton,
                (!dailyReminderEnabled || isReminderSaving) && { opacity: 0.5 },
              ]}
              activeOpacity={0.8}
              disabled={!dailyReminderEnabled || isReminderSaving}
              onPress={() => setShowReminderTimePicker(true)}
            >
              <View style={styles.timeButtonLeft}>
                <Clock3 size={18} color={theme.colors.textSecondary} />
                <Text style={styles.timeButtonText}>
                  {formatReminderTime(dailyReminderTime)}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.menuGroup}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && { borderBottomWidth: 0 },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.id === "edit") router.push("/edit-profile");
                  if (item.id === "password") router.push("/change-password");
                  if (item.id === "household") router.push("/household");
                  if (item.id === "notifications")
                    router.push("/notifications");
                  if (item.id === "feedback") router.push("/feedback");
                  // if (item.id === "forgot-password") router.push("/forgot-password");
                  if (item.id === "delete") handleDeleteAccount();
                }}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.05)"
                        : item.color,
                    },
                  ]}
                >
                  <item.icon
                    size={20}
                    color={isDarkMode ? "#A78BFA" : item.iconColor}
                  />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.menuGroup}>
            <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : "#EFF7F2",
                  },
                ]}
              >
                {isDarkMode ? (
                  <Moon size={20} color="#A78BFA" />
                ) : (
                  <Sun size={20} color="#F59E0B" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>Dark Mode</Text>
                <Text style={styles.themeDescription}>Toggle app theme</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={async (value) => {
                  dispatch(setTheme(value));
                  await storage.saveTheme(value);
                }}
                trackColor={{ false: "#CBD5E1", true: "#8B5CF6" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={[styles.menuGroup, { marginTop: 10 }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(239, 68, 68, 0.1)"
                      : "#FEF2F2",
                  },
                ]}
              >
                <LogOut size={20} color={theme.colors.error} />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <DateTimePickerModal
        isVisible={showReminderTimePicker}
        mode="time"
        date={(() => {
          const [hours, minutes] = dailyReminderTime.split(":").map(Number);
          const date = new Date();
          date.setHours(hours || 20, minutes || 0, 0, 0);
          return date;
        })()}
        onConfirm={handleReminderTimeConfirm}
        onCancel={() => setShowReminderTimePicker(false)}
        themeVariant={isDarkMode ? "dark" : "light"}
      />
    </View>
  );
}
