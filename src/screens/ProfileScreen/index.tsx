import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
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
} from "lucide-react-native";
import { getStyles } from "./styles";
import { useRouter } from "expo-router";
import { getInitials } from "../../utils/stringUtils";
import { useGlobalModal } from "../../hooks/useGlobalModal";

export default function ProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();

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
                      : "#F1F5F9",
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
                onValueChange={(value) => {
                  dispatch(setTheme(value));
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
