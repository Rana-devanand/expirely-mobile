import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Clipboard,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  Users,
  Plus,
  LogIn,
  Copy,
  RefreshCw,
  Home,
  Share2,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAppTheme } from "../../hooks/useAppTheme";
import { RootState, AppDispatch } from "../../store";
import {
  fetchMyHouseholdAsync,
  createHouseholdAsync,
  joinHouseholdAsync,
  leaveHouseholdAsync,
} from "../../store/householdSlice";
import { fetchProductsAsync } from "../../store/productSlice";
import { getStyles } from "./styles";
import { getInitials } from "../../utils/stringUtils";
import { useGlobalModal } from "../../hooks/useGlobalModal";
import { HouseholdMember } from "../../types/household";

type ModalMode = "create" | "join" | null;

const sanitizeInviteCode = (value: string) =>
  value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6);

const getJoinHouseholdErrorMessage = (error: any) => {
  const rawMessage =
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "";
  const message = String(rawMessage).trim();

  if (!message) {
    return "Unable to join the household. Please try again.";
  }

  const normalized = message.toLowerCase();
  if (
    normalized.includes("not found") ||
    normalized.includes("invalid") ||
    normalized.includes("invite code") ||
    normalized.includes("join code")
  ) {
    return "Invalid invite code. Please check the 6-character code and try again.";
  }

  if (normalized.includes("already")) {
    return "You are already connected to this household.";
  }

  return "Unable to join the household. Please try again.";
};

// ── OTP-style 6-box code input ────────────────────────────────────────────────
interface CodeInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  theme: any;
  isDarkMode: boolean;
}
function CodeInput({ value, onChange, disabled, theme, isDarkMode }: CodeInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);

  const safeValue = sanitizeInviteCode(value);
  const chars = Array.from({ length: 6 }, (_, i) => safeValue[i] || "");

  const handleKey = (index: number, text: string) => {
    const cleaned = sanitizeInviteCode(text);
    if (cleaned.length > 1) {
      onChange(cleaned);
      refs.current[Math.min(cleaned.length - 1, 5)]?.focus();
      return;
    }
    if (!cleaned) {
      // Backspace — clear this box and jump back
      const next = [...chars];
      next[index] = "";
      onChange(sanitizeInviteCode(next.join("")));
      if (index > 0) refs.current[index - 1]?.focus();
      return;
    }
    const char = cleaned[cleaned.length - 1];
    const next = [...chars];
    next[index] = char;
    onChange(sanitizeInviteCode(next.join("")));
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !chars[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const boxBg = isDarkMode ? "rgba(255,255,255,0.07)" : "#F4F1FF";
  const borderColor = (filled: boolean) =>
    filled ? "#7C3AED" : isDarkMode ? "rgba(255,255,255,0.12)" : "#DDD6FE";

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 12 }}>
        {chars.map((ch, i) => (
          <TextInput
            key={i}
            ref={(r) => { refs.current[i] = r; }}
            style={{
              width: 60,
              height: 58,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: borderColor(!!ch),
              backgroundColor: boxBg,
              textAlign: "center",
              fontSize: 22,
              fontWeight: "800",
              color: "#7C3AED",
              letterSpacing: 0,
            }}
            value={ch}
            onChangeText={(t) => handleKey(i, t)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
            maxLength={safeValue.length === 6 ? 1 : 6}
            autoCapitalize="characters"
            keyboardType="default"
            editable={!disabled}
            selectTextOnFocus
            caretHidden
          />
        ))}
      </View>
      <Text
        style={{
          textAlign: "center",
          color: theme.colors.textSecondary,
          fontSize: 12,
          marginBottom: 28,
        }}
      >
        Paste the full invite code into any box.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HouseholdScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showModal } = useGlobalModal();

  const { household, loading } = useSelector((state: RootState) => state.household);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [householdName, setHouseholdName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyHouseholdAsync());
    }, [dispatch])
  );

  const handleCreate = async () => {
    if (!householdName.trim()) {
      Toast.show({ type: "error", text1: "Please enter a household name." });
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(createHouseholdAsync(householdName.trim())).unwrap();
      dispatch(fetchProductsAsync());
      Toast.show({ type: "success", text1: "Household created! 🏠", text2: "Share the code with your family." });
      setModalMode(null);
      setHouseholdName("");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message || "Failed to create household." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    const normalizedJoinCode = sanitizeInviteCode(joinCode);

    if (normalizedJoinCode.length !== 6) {
      Toast.show({ type: "error", text1: "Enter all 6 characters of the code." });
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(joinHouseholdAsync(sanitizeInviteCode(joinCode))).unwrap();
      dispatch(fetchProductsAsync());
      Toast.show({ type: "success", text1: "Joined household! 🎉", text2: "You now share the inventory." });
      setModalMode(null);
      setJoinCode("");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message || "Failed to join household." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = () => {
    const isOwner = household?.owner_id === currentUser?.id;
    showModal({
      title: isOwner ? "⚠️ Delete Household" : "Leave Household",
      message: isOwner
        ? "As the owner, leaving will permanently delete the household and remove all members. This cannot be undone."
        : "Are you sure you want to leave this household? You'll only see your own inventory afterward.",
      confirmText: isOwner ? "Delete Household" : "Leave",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await dispatch(leaveHouseholdAsync()).unwrap();
          dispatch(fetchProductsAsync());
          Toast.show({ type: "success", text1: "You have left the household." });
        } catch (error: any) {
          Toast.show({ type: "error", text1: error.message || "Failed to leave household." });
        }
      },
    });
  };

  const handleCopyCode = () => {
    if (household?.join_code) {
      Clipboard.setString(household.join_code);
      Toast.show({ type: "success", text1: "Code copied!", text2: "Share it with family members." });
    }
  };

  const handleShare = async () => {
    if (!household?.join_code) return;
    try {
      await Share.share({
        title: `Join my household on Expirely`,
        message:
          `Hey! I'm inviting you to join my household "${household.name}" on Expirely — the smart expiry tracker 🏠\n\n` +
          `Use this 6-character invite code to join:\n\n` +
          `Download the app : https://play.google.com/store/apps/details?id=com.expirely.mobile` +
          `🔑  ${household.join_code}\n\n` +
          `Open the app → Profile → Family Household → Join a Household → enter the code above.`,
      });
    } catch (_) {
      // User cancelled or share failed — do nothing
    }
  };

  const renderMember = ({ item, index }: { item: HouseholdMember; index: number }) => {
    const isFirst = index === 0;
    return (
      <>
        {!isFirst && <View style={styles.memberSeparator} />}
        <View style={styles.memberRow}>
          <View style={styles.memberAvatar}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.memberAvatarImg} />
            ) : (
              <Text style={styles.memberAvatarText}>
                {getInitials(item.username || "?")}
              </Text>
            )}
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {item.username || "Unknown"}
              {item.user_id === currentUser?.id ? " (You)" : ""}
            </Text>
            <Text style={styles.memberRole}>
              Joined {new Date(item.joined_at).toLocaleDateString()}
            </Text>
          </View>
          {item.role === "OWNER" && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
        </View>
      </>
    );
  };

  if (loading && !household) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerEyebrow}>Shared inventory</Text>
          <Text style={styles.headerTitle}>Family Household</Text>
        </View>
        {household && (
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => dispatch(fetchMyHouseholdAsync())}
            activeOpacity={0.7}
          >
            <RefreshCw size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!household ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroGradientBg} />
              <View style={styles.heroIconContainer}>
                <Home size={38} color="#7C3AED" />
              </View>
              <Text style={styles.heroTitle}>Shared Household Inventory</Text>
              <Text style={styles.heroSubtitle}>
                Create a household so your whole family can manage expiry dates together — no more duplicate purchases.
              </Text>
            </View>

            <View style={styles.actionCards}>
              {/* Create card */}
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => { setHouseholdName(""); setModalMode("create"); }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "rgba(124,58,237,0.12)" }]}>
                  <Plus size={26} color="#7C3AED" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Create a Household</Text>
                  <Text style={styles.actionSubtitle}>Start a new shared space and invite family</Text>
                </View>
                <ChevronLeft size={18} color={theme.colors.textSecondary} style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>

              {/* Join card — icon changed to LogIn */}
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => { setJoinCode(""); setModalMode("join"); }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "rgba(16,185,129,0.12)" }]}>
                  <LogIn size={26} color="#10B981" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Join a Household</Text>
                  <Text style={styles.actionSubtitle}>Enter a 6-character code from a family member</Text>
                </View>
                <ChevronLeft size={18} color={theme.colors.textSecondary} style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.householdCard}>
              <View style={styles.householdHeadingRow}>
                <View style={styles.householdAvatar}>
                  <Users size={20} color="#7C3AED" />
                </View>
                <View style={styles.householdMeta}>
                  <Text style={styles.householdName}>{household.name}</Text>
                  <Text style={styles.codeLabel}>
                    {household.members?.length || 0} member{(household.members?.length || 0) !== 1 ? "s" : ""} connected
                  </Text>
                </View>
              </View>

              {/* Code display */}
              <View style={styles.codeSection}>
                <View>
                  <Text style={styles.codeLabel}>Invite Code</Text>
                  <Text style={styles.codeValue}>{household.join_code}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode} activeOpacity={0.8}>
                  <Copy size={18} color="#7C3AED" />
                </TouchableOpacity>
              </View>

              {/* Share row */}
              <View style={styles.shareRow}>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                  <Share2 size={16} color="#fff" />
                  <Text style={styles.shareBtnText}>Share Invite</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.copyOutlineBtn} onPress={handleCopyCode} activeOpacity={0.8}>
                  <Copy size={16} color="#7C3AED" />
                  <Text style={styles.copyOutlineBtnText}>Copy Code</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionLabel}>
              {household.members?.length || 0} Member{(household.members?.length || 0) !== 1 ? "s" : ""}
            </Text>

            <View style={styles.membersCard}>
              <FlatList
                data={household.members || []}
                keyExtractor={(item) => item.id}
                renderItem={renderMember}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.memberRow}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>No members found.</Text>
                  </View>
                }
              />
            </View>

            <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave} activeOpacity={0.8}>
              <Text style={styles.leaveBtnText}>
                {household.owner_id === currentUser?.id ? "Delete Household" : "Leave Household"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ── Create Household Modal ─────────────────────────────────── */}
      <Modal
        visible={modalMode === "create"}
        transparent
        animationType="slide"
        onRequestClose={() => !submitting && setModalMode(null)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <Pressable style={styles.modalOverlay} onPress={() => !submitting && setModalMode(null)}>
            <Pressable onPress={() => { }} style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Create a Household</Text>
              <Text style={styles.modalSubtitleLeft}>
                Give your home a name, then invite everyone with one shared code.
              </Text>

              <Text style={styles.inputLabel}>Household Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder='e.g. "The Smiths" or "Home"'
                placeholderTextColor={theme.colors.textSecondary}
                value={householdName}
                onChangeText={setHouseholdName}
                maxLength={40}
                editable={!submitting}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, submitting && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Create Household</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalMode(null)} disabled={submitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Join Household Modal ───────────────────────────────────── */}
      <Modal
        visible={modalMode === "join"}
        transparent
        animationType="slide"
        onRequestClose={() => !submitting && setModalMode(null)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <Pressable style={styles.modalOverlay} onPress={() => !submitting && setModalMode(null)}>
            <Pressable onPress={() => { }} style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <Text style={styles.modalTitle}>Join a Household</Text>
              <Text style={styles.modalSubtitle}>
                Ask your family member to share their 6-character invite code.
              </Text>

              {/* OTP-style 6-box code input */}
              <Text style={[styles.inputLabel, { textAlign: "center", marginBottom: 16 }]}>
                Invite Code
              </Text>
              <CodeInput
                value={joinCode}
                onChange={(value) => setJoinCode(sanitizeInviteCode(value))}
                disabled={submitting}
                theme={theme}
                isDarkMode={isDarkMode}
              />

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: "#059669" },
                  submitting && { opacity: 0.6 },
                  joinCode.length < 6 && { opacity: 0.4 },
                ]}
                onPress={handleJoin}
                disabled={submitting || joinCode.length < 6}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Join Household</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalMode(null)} disabled={submitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
