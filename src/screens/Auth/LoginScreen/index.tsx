import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { getStyles } from "./styles";
import { toast } from "../../../utils/toast";
import { userService } from "../../../services/user";
import { storage } from "../../../services/storage";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  googleLogin,
} from "../../../store/authSlice";
import { RootState, AppDispatch } from "../../../store";
import { googleSignInService } from "../../../services/googleAuth";
import { useEffect } from "react";

export default function LoginScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    dispatch(loginStart());
    try {
      const googleResult = await googleSignInService.signOutAndSignIn();
      const idToken = googleResult.idToken;

      if (idToken) {
        dispatch(googleLogin(idToken))
          .unwrap()
          .then(() => router.replace("/(tabs)"))
          .catch((error: any) => {
            console.error("Google login error", error);
            const errorMessage = error.message || "Google sign-in failed";
            dispatch(loginFailure(errorMessage));
            toast.error(errorMessage, "Google Login Failed");
          });
      }
    } catch (error: any) {
      if (error.message === "SIGN_IN_CANCELLED") {
        dispatch(loginFailure("Sign-in cancelled"));
        return;
      }
      const errorMessage = error.message || "Google Sign-In failed";
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage, "Google Login Failed");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(loginStart());

    try {
      const response = await userService.login({
        email,
        password,
        auth_provider: "credentials",
      });

      if (response.success) {
        // Save to persistent storage
        await storage.saveUser(response.data.user);
        await storage.saveTokens(
          response.data.accessToken,
          response.data.refreshToken,
        );

        dispatch(
          loginSuccess({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        router.replace("/(tabs)");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage, "Login Failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your tracking</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={theme.colors.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OR</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.8}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Image
                  source={require("./google-icon.png")}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/signup")}
            disabled={loading}
          >
            <Text style={[styles.signUpLink, loading && { opacity: 0.5 }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
