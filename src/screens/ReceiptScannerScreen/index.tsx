import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Camera,
  Plus,
  Calendar,
  ReceiptText,
  ScanLine,
  PackagePlus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../services/api";
import { getStyles } from "./styles";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { createProductAsync } from "../../store/productSlice";

interface ScannedItem {
  name: string;
  category: string;
  quantity: string;
  expiryDays: number;
}

type ReceiptScanResponse = {
  success: boolean;
  data: {
    items: ScannedItem[];
  };
};

export default function ReceiptScannerScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [addingAll, setAddingAll] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera access to scan receipts.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      scanReceipt(result.assets[0].base64);
    }
  };

  const scanReceipt = async (base64: string) => {
    setLoading(true);
    setItems([]);
    try {
      const response = await api.post<ReceiptScanResponse>("/ai/scan-receipt", {
        image: base64,
      });
      if (response.success) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error("Scanning Error:", error);
      Alert.alert("Error", "Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseQty = (quantity: string): number => {
    const match = quantity.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  };

  const handleAddItem = (item: ScannedItem) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + item.expiryDays);

    dispatch(
      createProductAsync({
        name: item.name,
        category: item.category,
        qty: parseQty(item.quantity),
        expiryDate: expiryDate.toISOString(),
      }),
    );
    setItems(items.filter((current) => current !== item));
  };

  const handleAddAll = async () => {
    setAddingAll(true);
    try {
      for (const item of items) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + item.expiryDays);

        await dispatch(
          createProductAsync({
            name: item.name,
            category: item.category,
            qty: parseQty(item.quantity),
            expiryDate: expiryDate.toISOString(),
          }),
        );
      }
      Alert.alert("Success", "All items added to inventory!");
      setItems([]);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to add items.");
    } finally {
      setAddingAll(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Vision assistant</Text>
          <Text style={styles.title}>AI Receipt Scanner</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!image ? (
          <View>
            <View style={styles.heroPanel}>
              <View style={styles.heroIcon}>
                <ReceiptText size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Add many products at once</Text>
              <Text style={styles.heroSubtitle}>
                Snap a receipt and AI extracts product names, categories,
                quantities, and suggested expiry dates for quick review.
              </Text>
            </View>

            <View style={styles.aiVisual}>
              <View style={styles.receiptMock}>
                <View style={styles.receiptHeader}>
                  <ReceiptText size={18} color={theme.colors.primary} />
                  <Text style={styles.receiptTitle}>Receipt</Text>
                </View>
                <View style={styles.receiptLine} />
                <View style={[styles.receiptLine, { width: "72%" }]} />
                <View style={[styles.receiptLine, { width: "86%" }]} />
                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptTotal}>Items</Text>
                  <Text style={styles.receiptTotal}>4</Text>
                </View>
              </View>

              <View style={styles.aiBridge}>
                <View style={styles.scanBubble}>
                  <ScanLine size={21} color="#FFFFFF" />
                </View>
                <ArrowRight size={18} color={theme.colors.textSecondary} />
              </View>

              <View style={styles.inventoryMock}>
                <View style={styles.inventoryHeader}>
                  <PackagePlus size={18} color={theme.colors.success} />
                  <Text style={styles.inventoryTitle}>Inventory</Text>
                </View>
                {["Milk", "Bread", "Apples"].map((label) => (
                  <View key={label} style={styles.inventoryRow}>
                    <CheckCircle2 size={14} color={theme.colors.success} />
                    <Text style={styles.inventoryText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.stepsRow}>
              <View style={styles.stepPill}>
                <Camera size={15} color={theme.colors.primary} />
                <Text style={styles.stepText}>Capture</Text>
              </View>
              <View style={styles.stepPill}>
                <Sparkles size={15} color={theme.colors.primary} />
                <Text style={styles.stepText}>Extract</Text>
              </View>
              <View style={styles.stepPill}>
                <PackagePlus size={15} color={theme.colors.primary} />
                <Text style={styles.stepText}>Add</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.scanButton} onPress={pickImage}>
              <Camera size={20} color="#FFF" />
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.previewCard}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={pickImage}>
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  Extracting items from receipt...
                </Text>
              </View>
            ) : (
              items.length > 0 && (
                <View style={styles.itemsContainer}>
                  <View style={styles.resultsHeader}>
                    <View>
                      <Text style={styles.resultsTitle}>
                        Found {items.length} Items
                      </Text>
                      <Text style={styles.resultsSubtitle}>
                        Review before adding to inventory
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addAllButton}
                      onPress={handleAddAll}
                      disabled={addingAll}
                    >
                      {addingAll ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.addAllText}>Add All</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {items.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemMeta}>
                          <View style={styles.tag}>
                            <Text style={styles.tagText}>{item.category}</Text>
                          </View>
                          <View style={styles.tag}>
                            <Text style={styles.tagText}>
                              Qty {item.quantity}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.expiryRow}>
                          <Calendar
                            size={14}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.expiryText}>
                            Suggested expiry in {item.expiryDays} days
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddItem(item)}
                      >
                        <Plus size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
