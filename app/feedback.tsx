import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../src/store";
import { useAppTheme } from "../src/hooks/useAppTheme";
import { useGlobalModal } from "../src/hooks/useGlobalModal";
import {
  ChevronLeft,
  Star,
  MessageSquare,
  CheckSquare,
  Square,
  Send,
} from "lucide-react-native";
import { api } from "../src/services/api";

const APP_FEATURES = [
  "Product Expiry Tracking",
  "Barcode Scanner",
  "AI Expiry Suggestions",
  "Push Notifications",
  "Dashboard & Analytics",
  "Category Management",
  "Product Search & Filters",
  "Forgot / Reset Password",
  "Dark Mode",
  "Profile Management",
];

export default function FeedbackScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showModal } = useGlobalModal();

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  // Y offset of the comments card, captured via onLayout
  const commentCardY = useRef<number>(0);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Scroll exactly to the comments card when the textarea gains focus
  const handleCommentFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: commentCardY.current - 12, animated: true });
    }, 250); // small delay so keyboard is open before we scroll
  };

  const handleSubmit = async () => {
    if (selectedFeatures.length === 0) {
      Alert.alert("Select Features", "Please select at least one feature you want to give feedback on.");
      return;
    }
    if (rating === 0) {
      Alert.alert("Rate the App", "Please give a star rating before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/users/feedback", {
        username: user?.username || user?.email || "User",
        features: selectedFeatures,
        rating,
        message,
      });

      // Use the app's custom global modal instead of system Alert
      showModal({
        title: "🎉 Thank You!",
        message:
          "Your feedback has been submitted successfully. We appreciate you taking the time to help us improve Expirely!",
        confirmText: "Done",
        type: "success",
        onConfirm: () => router.back(),
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to send feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cardBg = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const sectionBg = isDarkMode ? "#252525" : "#F8FAFC";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Send Feedback
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Hero */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: isDarkMode ? "#1a1a2e" : "#EEF2FF" },
          ]}
        >
          <Text style={styles.heroEmoji}>💬</Text>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            How's your Expirely experience?
          </Text>
          <Text
            style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}
          >
            Your feedback directly shapes the future of the app. Let us know what's working and what could be better!
          </Text>
        </View>

        {/* Star Rating */}
        <View
          style={[
            styles.section,
            { backgroundColor: cardBg, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Star size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Overall Rating
            </Text>
          </View>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Tap a star to rate
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starBtn}
              >
                <Star
                  size={38}
                  color={star <= rating ? "#F59E0B" : theme.colors.border}
                  fill={star <= rating ? "#F59E0B" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: "#F59E0B" }]}>
              {
                ["", "Poor 😞", "Fair 😐", "Good 🙂", "Great 😊", "Excellent 🤩"][
                  rating
                ]
              }
            </Text>
          )}
        </View>

        {/* Feature Selection */}
        <View
          style={[
            styles.section,
            { backgroundColor: cardBg, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <CheckSquare size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Features to Review
            </Text>
          </View>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Select all that apply
          </Text>
          <View style={styles.featuresGrid}>
            {APP_FEATURES.map((feature) => {
              const isSelected = selectedFeatures.includes(feature);
              return (
                <TouchableOpacity
                  key={feature}
                  onPress={() => toggleFeature(feature)}
                  activeOpacity={0.75}
                  style={[
                    styles.featureChip,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? "rgba(99, 102, 241, 0.25)"
                          : "#EEF2FF"
                        : sectionBg,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  {isSelected ? (
                    <CheckSquare size={15} color={theme.colors.primary} />
                  ) : (
                    <Square size={15} color={theme.colors.textSecondary} />
                  )}
                  <Text
                    style={[
                      styles.featureChipText,
                      {
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.text,
                        fontWeight: isSelected ? "600" : "400",
                      },
                    ]}
                  >
                    {feature}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedFeatures.length > 0 && (
            <Text
              style={[styles.selectedCount, { color: theme.colors.primary }]}
            >
              {selectedFeatures.length} feature
              {selectedFeatures.length > 1 ? "s" : ""} selected
            </Text>
          )}
        </View>

        {/* Message / Comments */}
        <View
          onLayout={(e) => {
            commentCardY.current = e.nativeEvent.layout.y;
          }}
          style={[
            styles.section,
            { backgroundColor: cardBg, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <MessageSquare size={18} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Additional Comments
            </Text>
          </View>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Optional — tell us more
          </Text>
          <TextInput
            ref={textInputRef}
            style={[
              styles.messageInput,
              {
                backgroundColor: sectionBg,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Share your thoughts, suggestions, or report a bug..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
            onFocus={handleCommentFocus}
            scrollEnabled={false}
          />
          <Text
            style={[styles.charCount, { color: theme.colors.textSecondary }]}
          >
            {message.length} characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor:
                submitting || selectedFeatures.length === 0 || rating === 0
                  ? isDarkMode
                    ? "#374151"
                    : "#CBD5E1"
                  : theme.colors.primary,
              opacity: submitting ? 0.8 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
          Your feedback is sent to the Expirely team and helps us improve the
          app for everyone.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 4,
  },
  heroEmoji: { fontSize: 44, marginBottom: 10 },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    marginLeft: 26,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  starBtn: { padding: 4 },
  ratingLabel: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  featuresGrid: {
    gap: 8,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  featureChipText: {
    fontSize: 14,
    flex: 1,
  },
  selectedCount: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "right",
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 110,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
});
