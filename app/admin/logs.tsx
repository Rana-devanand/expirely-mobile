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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import {
  ChevronLeft,
  Search,
  Activity,
  Clock,
  User,
  Sparkles,
  PlusCircle,
  Edit,
  Trash2,
  Lock,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { adminService, SystemLog } from "../../src/services/adminService";
import dayjs from "dayjs";

export default function SystemLogsScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemLogs();
      setLogs(data);
      filterLogs(searchQuery, data);
    } catch (error) {
      console.error("Failed to load logs:", error);
      Alert.alert("Error", "Failed to retrieve activity logs. Make sure you are an Admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await adminService.getSystemLogs();
      setLogs(data);
      filterLogs(searchQuery, data);
    } catch (error) {
      console.error("Failed to refresh logs:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterLogs = (query: string, logList: SystemLog[]) => {
    if (!query) {
      setFilteredLogs(logList);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = logList.filter(
        (log) =>
          log.action.toLowerCase().includes(lowerQuery) ||
          (log.users?.username || "").toLowerCase().includes(lowerQuery) ||
          (log.users?.email || "").toLowerCase().includes(lowerQuery) ||
          JSON.stringify(log.details || "").toLowerCase().includes(lowerQuery)
      );
      setFilteredLogs(filtered);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterLogs(text, logs);
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getLogIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("SIGNUP")) {
      return act.includes("SOCIAL") ? Globe : Lock;
    }
    if (act.includes("ADD") || act.includes("CREATE")) {
      return PlusCircle;
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return Edit;
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return Trash2;
    }
    if (act.includes("AI")) {
      return Sparkles;
    }
    return Activity;
  };

  const getLogColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("SIGNUP")) {
      return "#3B82F6"; // Blue
    }
    if (act.includes("ADD") || act.includes("CREATE")) {
      return "#10B981"; // Green
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "#F59E0B"; // Amber
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
      return "#EF4444"; // Red
    }
    if (act.includes("AI")) {
      return "#8B5CF6"; // Violet
    }
    return "#6B7280"; // Gray
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderItem = ({ item }: { item: SystemLog }) => {
    const isExpanded = expandedLogId === item.id;
    const actionColor = getLogColor(item.action);
    const IconComponent = getLogIcon(item.action);

    return (
      <View
        style={[
          styles.logCard,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpandLog(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.avatarCircle, { backgroundColor: `${actionColor}15` }]}>
            <IconComponent size={20} color={actionColor} />
          </View>
          <View style={styles.logInfo}>
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              {formatActionName(item.action)}
            </Text>
            <View style={styles.userRow}>
              <User size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.userText, { color: theme.colors.textSecondary }]}>
                {item.users?.username || item.users?.email || "System / Guest"}
              </Text>
            </View>
          </View>
          <View style={styles.timeSection}>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {dayjs(item.created_at).format("h:mm A")}
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {dayjs(item.created_at).format("MMM D")}
            </Text>
            {isExpanded ? (
              <ChevronUp size={16} color={theme.colors.textSecondary} style={{ marginTop: 4 }} />
            ) : (
              <ChevronDown size={16} color={theme.colors.textSecondary} style={{ marginTop: 4 }} />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View
            style={[
              styles.detailsContainer,
              {
                borderTopColor: theme.colors.border,
                backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              },
            ]}
          >
            <Text style={[styles.detailsTitle, { color: theme.colors.text }]}>Log Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>User Email:</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {item.users?.email || "N/A"}
                </Text>
              </View>
              {item.details &&
                Object.keys(item.details).map((key) => (
                  <View style={styles.detailRow} key={key}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </Text>
                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                      {typeof item.details[key] === "object"
                        ? JSON.stringify(item.details[key])
                        : String(item.details[key])}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDarkMode ? "#2D2D2D" : "#F1F5F9" }]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={[styles.title, { color: theme.colors.text }]}>System Logs</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Activity tracker for this system
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search logs by action, user or details..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Logs List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>
            Fetching logs from database...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Activity size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={{ marginTop: 12, fontSize: 16, color: theme.colors.text, fontWeight: "600" }}>
                No Activity Logs Found
              </Text>
              <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
                {searchQuery ? "Try refining your search query" : "Everything is quiet in the system"}
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
    marginTop: 40
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitleBox: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timeSection: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
});
