import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState, AppDispatch } from "../../store";
import { updateProfileAsync } from "../../store/authSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ChevronLeft, User, Mail, Camera, Pencil } from "lucide-react-native";
import { getStyles } from "./styles";
import { getInitials } from "../../utils/stringUtils";
import { useImagePicker } from "../../hooks/useImagePicker";
import { uploadService } from "../../services/uploadService";
import { toast } from "../../utils/toast";

export default function EditProfileScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const { pickImage } = useImagePicker();

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setProfileImage(uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setLoading(true);
    let finalImageUrl = profileImage;

    // Upload image if it's local
    if (profileImage && !profileImage.startsWith("http")) {
      try {
        setIsUploading(true);
        const uploadRes = await uploadService.uploadProductImage(profileImage);
        finalImageUrl = uploadRes.data.imageUrl;
      } catch (error) {
        console.error("Image upload failed", error);
        toast.info("Image upload failed, but updating profile without it.");
      } finally {
        setIsUploading(false);
      }
    }

    try {
      await dispatch(
        updateProfileAsync({
          username,
          email,
          avatar_url: finalImageUrl || undefined,
        }),
      ).unwrap();
      toast.success("Profile updated successfully!");
      router.back();
    } catch (error: any) {
      toast.error(error || "Failed to update profile");
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
          disabled={loading || isUploading}
        >
          <ChevronLeft
            color={
              loading || isUploading
                ? theme.colors.textSecondary
                : theme.colors.text
            }
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePickImage}
              activeOpacity={0.8}
              disabled={loading || isUploading}
            >
              <View style={styles.avatarCircle}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {getInitials(username)}
                  </Text>
                )}
              </View>
              <View style={styles.editBadge}>
                <Camera color="#FFF" size={18} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, { opacity: 0.7 }]}>
                <Mail
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  editable={false}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <Text style={[styles.label, { fontSize: 12, marginTop: 4 }]}>
                Email cannot be changed currently.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (loading || isUploading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading || isUploading}
          >
            {loading || isUploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
