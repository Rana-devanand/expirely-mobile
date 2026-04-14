import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ArrowLeft,
  Zap,
  MoreHorizontal,
  Keyboard,
  Scan,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStyles } from "./styles";
import { CameraView, useCameraPermissions } from "expo-camera";
import { productService } from "../../services/productService";

export default function ScannerScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const [isManualMode, setIsManualMode] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLoading || isManualMode) return;
    setScanned(true);
    await lookupProduct(data);
  };

  const lookupProduct = async (barcode: string) => {
    if (!barcode) return;
    setIsLoading(true);
    try {
      console.log("Looking up barcode:", barcode);
      const productInfo = await productService.fetchByBarcode(barcode);

      if (productInfo) {
        router.push({
          pathname: "/addProduct",
          params: {
            scannedName: productInfo.name,
            scannedBarcode: barcode,
            scannedImageUrl: productInfo.imageUrl || "",
            scannedCategory: productInfo.category || "",
            scannedExpiryDate: productInfo.expirationDate || productInfo.estimatedExpiry || "",
            scannedIngredients: productInfo.ingredients || "",
          },
        });
      } else {
        router.push({
          pathname: "/addProduct",
          params: { scannedBarcode: barcode },
        });
      }
    } catch (error) {
      console.error("Lookup failed:", error);
      router.push({
        pathname: "/addProduct",
        params: { scannedBarcode: barcode },
      });
    } finally {
      setIsLoading(false);
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text
          style={{
            color: theme.colors.text,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.lookupButton}
          onPress={requestPermission}
        >
          <Text style={styles.lookupButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft
            color={isLoading ? theme.colors.textSecondary : theme.colors.text}
            size={24}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {isManualMode ? "Enter Barcode" : "Scan Barcode"}
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setTorch(!torch)}
        >
          <Zap color={torch ? "#FBBF24" : theme.colors.primary} size={24} fill={torch ? "#FBBF24" : "none"} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {!isManualMode ? (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              enableTorch={torch}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                ],
              }}
            >
              {/* This container centers the viewfinder */}
              <View style={styles.viewfinderCenterer}>
                <View style={styles.viewfinderContainer}>
                  <View style={styles.viewfinder} />
                  <View style={[styles.cornerBase, styles.topLeft]} />
                  <View style={[styles.cornerBase, styles.topRight]} />
                  <View style={[styles.cornerBase, styles.bottomLeft]} />
                  <View style={[styles.cornerBase, styles.bottomRight]} />
                </View>
              </View>
            </CameraView>

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={{ color: "#FFF", marginTop: 10 }}>
                  Fetching Product...
                </Text>
              </View>
            )}

            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                Align barcode within the frame to scan automatically
              </Text>
            </View>
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.manualEntryContainer}
          >
            <View style={styles.manualCard}>
              <Text style={[styles.manualTitle, { color: theme.colors.text }]}>
                Manually Enter Code
              </Text>
              <Text style={styles.manualSubtitle}>
                Type the barcode number found on the product packaging
              </Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.manualInput, { color: theme.colors.text }]}
                  placeholder="e.g. 8901030611841"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.lookupButton,
                  (!manualBarcode || isLoading) && { opacity: 0.5 },
                ]}
                onPress={() => lookupProduct(manualBarcode)}
                disabled={!manualBarcode || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.lookupButtonText}>Look Up Product</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.bottomSheet}>
        {!isManualMode ? (
          <TouchableOpacity
            style={[styles.manualButton, isLoading && { opacity: 0.5 }]}
            activeOpacity={0.7}
            onPress={() => setIsManualMode(true)}
            disabled={isLoading}
          >
            <Keyboard color={isDarkMode ? "#FFF" : "#1A1C1E"} size={20} />
            <Text style={styles.manualButtonText}>Enter Barcode Manually</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.manualButton, isLoading && { opacity: 0.5 }]}
            activeOpacity={0.7}
            onPress={() => setIsManualMode(false)}
            disabled={isLoading}
          >
            <Scan color={isDarkMode ? "#FFF" : "#1A1C1E"} size={20} />
            <Text style={styles.manualButtonText}>Back to Scanner</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
