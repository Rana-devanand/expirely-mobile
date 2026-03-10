import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { AppDispatch } from "../../store";
import { changePasswordAsync } from "../../store/authSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react-native";
import { getStyles } from "./styles";
import { toast } from "../../utils/toast";

export default function ChangePasswordScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simple validation
  const isFormValid =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  const handleChangePassword = async () => {
    if (!isFormValid) {
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
      } else {
        toast.error("Password must be at least 6 characters long");
      }
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        changePasswordAsync({
          currentPassword,
          newPassword,
        }),
      ).unwrap();
      toast.success("Password changed successfully!");
      router.back();
    } catch (error: any) {
      toast.error(error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <Text style={styles.title}>Change Password</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Your new password must be different from previous used passwords.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Lock
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Lock
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNew(!showNew)}
                >
                  {showNew ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Lock
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.requirementSection}>
              <Text style={styles.requirementTitle}>Password Requirements</Text>
              <View style={styles.requirementItem}>
                <CheckCircle2
                  size={16}
                  color={
                    newPassword.length >= 6
                      ? "#10B981"
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    newPassword.length >= 6 && { color: "#10B981" },
                  ]}
                >
                  At least 6 characters long
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <CheckCircle2
                  size={16}
                  color={
                    newPassword.length > 0 && newPassword === confirmPassword
                      ? "#10B981"
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    newPassword.length > 0 &&
                      newPassword === confirmPassword && { color: "#10B981" },
                  ]}
                >
                  Passwords must match
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
