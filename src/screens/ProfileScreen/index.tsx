import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, setTheme } from "../../store/uiSlice";
import { logoutUser } from "../../store/authSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import { RootState } from "../../store";
import {
  ChevronLeft,
  User,
  Lock,
  Bell,
  Shield,
  Languages,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Pencil,
  Package,
  Trash2,
  Key,
  MessageSquare,
} from "lucide-react-native";
import { getStyles } from "./styles";
import { useRouter } from "expo-router";
import { getInitials } from "../../utils/stringUtils";
import { useGlobalModal } from "../../hooks/useGlobalModal";
import { adminService } from "../../services/adminService";
import { api } from "../../services/api";
import { storage } from "../../services/storage";

export default function ProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();

  const [adminStats, setAdminStats] = useState<{ totalUsers: number; totalProducts: number } | null>(null);

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
          // 3. Show success alert
          Alert.alert("Success", "Your account was permanently deleted.");
        } catch (error: any) {
          console.error("Account deletion failed:", error);
          Alert.alert(
            "Error",
            error.message || "Failed to delete account. Please try again.",
          );
        }
      },
    });
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
            <TouchableOpacity style={styles.editBadge}>
              <Pencil color="#FFF" size={16} />
            </TouchableOpacity>
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
    </View>
  );
}
