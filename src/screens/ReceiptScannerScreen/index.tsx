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
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { CONFIG } from "../../services/config";
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

export default function ReceiptScannerScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode) as any;
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
      const response = await axios.post(`${CONFIG.API_URL}/ai/scan-receipt`, {
        image: base64,
      });
      if (response.data.success) {
        setItems(response.data.data.items);
      }
    } catch (error) {
      console.error("Scanning Error:", error);
      Alert.alert("Error", "Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: ScannedItem) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + item.expiryDays);

    const parseQty = (q: string): number => {
      const match = q.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    };

    const newProduct = {
      name: item.name,
      category: item.category,
      qty: parseQty(item.quantity),
      expiryDate: expiryDate.toISOString(),
    };

    dispatch(createProductAsync(newProduct));
    setItems(items.filter((i) => i !== item));
  };

  const handleAddAll = async () => {
    setAddingAll(true);
    const parseQty = (q: string): number => {
      const match = q.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    };
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
        <Text style={styles.title}>AI Receipt Scanner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!image ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconCircle}>
              <Camera size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Take a photo of your receipt</Text>
            <Text style={styles.emptySubtitle}>
              Our AI will automatically extract items, categories, and suggest
              expiry dates.
            </Text>
            <TouchableOpacity style={styles.scanButton} onPress={pickImage}>
              <Camera size={20} color="#FFF" style={{ marginRight: 8 }} />
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
                    <Text style={styles.resultsTitle}>
                      Found {items.length} Items
                    </Text>
                    <TouchableOpacity
                      onPress={handleAddAll}
                      disabled={addingAll}
                    >
                      {addingAll ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                        />
                      ) : (
                        <Text style={styles.addAllText}>Add All Items</Text>
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
                              Qty: {item.quantity}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.expiryRow}>
                          <Calendar
                            size={14}
                            color={theme.colors.textSecondary}
                          />
                          <Text style={styles.expiryText}>
                            Suggested: {item.expiryDays} days
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
