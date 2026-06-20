import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import { ChevronLeft, Search, User, ShieldAlert, ShieldCheck } from "lucide-react-native";
import { adminService, AdminUser } from "../../src/services/adminService";

export default function AdminUsersScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      filterUsers(searchQuery, data);
    } catch (error) {
      console.error("Failed to load users:", error);
      Alert.alert("Error", "Failed to retrieve users. Make sure you are an Admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      filterUsers(searchQuery, data);
    } catch (error) {
      console.error("Failed to refresh users:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterUsers = (query: string, userList: AdminUser[]) => {
    if (!query) {
      setFilteredUsers(userList);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = userList.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerQuery) ||
          u.email.toLowerCase().includes(lowerQuery),
      );
      setFilteredUsers(filtered);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterUsers(text, users);
  };

  const handleToggleStatus = (user: AdminUser) => {
    const action = user.status === "Active" ? "block" : "unblock";
    const newStatus = user.status === "Active" ? "blocked" : "active";

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.toUpperCase(),
          style: user.status === "Active" ? "destructive" : "default",
          onPress: async () => {
            try {
              const res = await adminService.toggleUserStatus(user.id, newStatus);
              if (res.success) {
                Alert.alert("Success", res.message);
                // Update local state
                const updated = users.map((u) => {
                  if (u.id === user.id) {
                    return {
                      ...u,
                      status: newStatus === "active" ? ("Active" as const) : ("Blocked" as const),
                    };
                  }
                  return u;
                });
                setUsers(updated);
                filterUsers(searchQuery, updated);
              }
            } catch (error: any) {
              console.error("Failed to update status:", error);
              Alert.alert("Error", error.message || "Failed to update user status.");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: AdminUser }) => {
    const isBlocked = item.status === "Blocked";
    return (
      <View
        style={[
          styles.userCard,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <User size={20} color={isDarkMode ? "#A78BFA" : theme.colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              {item.email}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isBlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              },
            ]}
            onPress={() => handleToggleStatus(item)}
          >
            {isBlocked ? (
              <ShieldCheck size={18} color="#10B981" />
            ) : (
              <ShieldAlert size={18} color="#EF4444" />
            )}
            <Text
              style={[
                styles.actionText,
                { color: isBlocked ? "#10B981" : "#EF4444" },
              ]}
            >
              {isBlocked ? "Unblock" : "Block"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>
              Joined
            </Text>
            <Text style={[styles.footerVal, { color: theme.colors.text }]}>
              {item.joinDate}
            </Text>
          </View>
          <View>
            <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>
              Products
            </Text>
            <Text style={[styles.footerVal, { color: theme.colors.text, textAlign: "right" }]}>
              {item.products}
            </Text>
          </View>
          <View>
            <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>
              Status
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isBlocked ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isBlocked ? "#EF4444" : "#10B981" },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>All Users</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Search size={20} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search by name or email..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
                No users found.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerVal: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});
