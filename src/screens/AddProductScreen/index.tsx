import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useImagePicker } from "../../hooks/useImagePicker";
import { uploadService } from "../../services/uploadService";
import { admobService } from "../../services/admobService";
import {
  createProductAsync,
  updateProductAsync,
} from "../../store/productSlice";
import { productService } from "../../services/productService";
import {
  fetchCategories,
  createCategoryAsync,
} from "../../store/categorySlice";
import { AppDispatch, RootState } from "../../store";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Camera,
  ChevronDown,
  Plus,
  Minus,
  Snowflake,
  Package,
  Activity,
  HelpCircle,
  Thermometer,
} from "lucide-react-native";
import { getStyles } from "./styles";
import dayjs from "dayjs";
import { Provider } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { toast } from "../../utils/toast";

const COLORS = [
  "#D1FAE5",
  "#FFEDD5",
  "#EDE9FE",
  "#E0F2FE",
  "#FEF9C3",
  "#FCE7F3",
];

export default function AddProductScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const loading = useSelector((state: RootState) => state.products.loading);
  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.category,
  );
  const { id, scannedName, scannedBarcode, scannedImageUrl, scannedCategory, scannedExpiryDate, scannedIngredients, templateId, templateName, templateCategory, templateQty, templateShelfLife, templateImageUrl } =
    useLocalSearchParams<{
      id: string;
      scannedName?: string;
      scannedBarcode?: string;
      scannedImageUrl?: string;
      scannedCategory?: string;
      scannedExpiryDate?: string;
      scannedIngredients?: string;
      templateId?: string;
      templateName?: string;
      templateCategory?: string;
      templateQty?: string;
      templateShelfLife?: string;
      templateImageUrl?: string;
    }>();
  const isEditMode = !!id;
  const existingProduct = useSelector((state: RootState) =>
    state.products.products.find((p) => p.id === id),
  );

  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [category, setCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [barcode, setBarcode] = useState("");
  const [storageLocation, setStorageLocation] = useState<"fridge" | "freezer" | "pantry" | "medicine_box" | "other">("other");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [shelfLifeDays, setShelfLifeDays] = useState(7);

  const { takePhoto, pickImage } = useImagePicker();

  React.useEffect(() => {
    if (isEditMode && existingProduct) {
      setName(existingProduct.name);
      setExpiryDate(existingProduct.expiryDate);
      setCategory(existingProduct.category);
      setSelectedColor(existingProduct.color || COLORS[0]);
      setProductImage(existingProduct.imageUrl || null);
      setQty(existingProduct.qty || 1);
      setNotes(existingProduct.notes || "");
      setBarcode(existingProduct.barcode || "");
      setStorageLocation(existingProduct.storageLocation || "other");
    } else if (templateId) {
      if (templateName) setName(templateName);
      if (templateCategory) setCategory(templateCategory);
      if (templateQty) setQty(Number(templateQty) || 1);
      if (templateImageUrl) setProductImage(templateImageUrl);
      if (templateShelfLife) {
        const days = Number(templateShelfLife);
        setExpiryDate(dayjs().add(days, "day").format("YYYY-MM-DD"));
      }
    } else if (scannedName || scannedBarcode) {
      if (scannedName) setName(scannedName);
      if (scannedBarcode) setBarcode(scannedBarcode);
      if (scannedImageUrl) setProductImage(scannedImageUrl);
      if (scannedCategory) setCategory(scannedCategory);
      if (scannedIngredients) setIngredients(scannedIngredients);
    }
  }, [
    isEditMode,
    existingProduct,
    templateId,
    templateName,
    templateCategory,
    templateQty,
    templateShelfLife,
    templateImageUrl,
    scannedName,
    scannedBarcode,
    scannedImageUrl,
    scannedCategory,
    scannedExpiryDate,
    scannedIngredients
  ]);

  const handleAIScanLabel = async () => {
    const uri = await takePhoto();
    if (!uri) return;

    try {
      setIsAIAnalyzing(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(",")[1]);
        };
      });
      reader.readAsDataURL(blob);
      const base64Image = await base64Promise;

      console.log("Analyzing label with AI...");
      const result = await productService.extractDatesFromImage(base64Image);

      if (result.data?.expiryDate) {
        setExpiryDate(result.data.expiryDate);
        toast.success(
          "AI extracted Expiry Date: " + result.data.expiryDate,
          "AI Extracted",
        );
      } else {
        toast.info(
          "AI couldn't find a clear expiry date. Please enter it manually.",
          "AI Info",
        );
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast.error("AI Analysis failed. Please enter the date manually.");
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  const categoryButtonRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const toggleDropdown = () => {
    if (!showCategoryMenu) {
      categoryButtonRef.current?.measure(
        (x, y, width, height, pageX, pageY) => {
          setDropdownLayout({
            top: pageY + height + 4,
            left: pageX,
            width: width,
          });
          setShowCategoryMenu(true);
        },
      );
    } else {
      setShowCategoryMenu(false);
    }
  };

  const handleSave = async () => {
    if (!name || !expiryDate || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let finalImageUrl = productImage || "";
    if (productImage && !productImage.startsWith("http")) {
      try {
        setIsUploading(true);
        const uploadRes = await uploadService.uploadProductImage(productImage);
        finalImageUrl = uploadRes.data.imageUrl;
      } catch (error: any) {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload image. Please try again.");
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const saveProductLogic = async () => {
      try {
        if (isEditMode && id) {
          await dispatch(
            updateProductAsync({
              id,
              data: {
                name,
                category,
                expiryDate,
                color: selectedColor,
                imageUrl: finalImageUrl,
                notes,
                ingredients,
                qty,
                barcode,
                storageLocation,
              },
            }),
          ).unwrap();
          toast.success("Product updated successfully!");
        } else {
          await dispatch(
            createProductAsync({
              name,
              category,
              expiryDate,
              color: selectedColor,
              imageUrl: finalImageUrl,
              notes,
              ingredients,
              qty,
              barcode,
              storageLocation,
            }),
          ).unwrap();

          if (saveAsTemplate) {
            try {
              const { createTemplateAsync } = await import("../../store/recurringSlice");
              await dispatch(
                createTemplateAsync({
                  name,
                  category,
                  default_qty: qty,
                  default_shelf_life_days: shelfLifeDays,
                  image_url: finalImageUrl,
                })
              ).unwrap();
            } catch (err) {
              console.error("Failed to auto-create recurring template:", err);
            }
          }

          toast.success("Product saved successfully!");
        }
        router.back();
      } catch (error: any) {
        toast.error(error || "Failed to save product.");
      }
    };

    try {
      admobService.showInterstitialAd(saveProductLogic);
    } catch (adError) {
      console.warn("Failed to show AdMob Ad, saving immediately:", adError);
      await saveProductLogic();
    }
  };

  React.useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const result = await dispatch(
        createCategoryAsync({
          name: newCategoryName.trim(),
          color: selectedColor,
        }),
      ).unwrap();
      setCategory(result.name);
      setNewCategoryName("");
      setShowAddCategoryModal(false);
      toast.success(`Category "${result.name}" created!`);
    } catch (error: any) {
      toast.error(error || "Failed to create category");
    }
  };

  const handleSelectImageSource = async (
    source: "camera" | "gallery" | "remove",
  ) => {
    setShowImageSourceModal(false);
    if (source === "remove") {
      setProductImage(null);
      return;
    }
    const uri = source === "camera" ? await takePhoto() : await pickImage();
    if (uri) {
      setProductImage(uri);
    }
  };

  const handleConfirmDate = (date: Date) => {
    setExpiryDate(dayjs(date).format("YYYY-MM-DD"));
    setDatePickerVisibility(false);
  };

  const renderAddCategoryModal = () => (
    <Modal visible={showAddCategoryModal} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={() => setShowAddCategoryModal(false)}
        />
        <View style={styles.categoryModalContainer}>
          <Text style={styles.modalTitle}>New Category</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Category name..."
            placeholderTextColor="#94A3B8"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            autoFocus
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setShowAddCategoryModal(false);
                setNewCategoryName("");
              }}
            >
              <Text
                style={[styles.modalButtonText, { color: theme.colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={handleCreateCategory}
            >
              <Text style={[styles.modalButtonText, { color: "#FFF" }]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderCategoryDropdown = () => (
    <Modal visible={showCategoryMenu} transparent animationType="none">
      <TouchableWithoutFeedback onPress={() => setShowCategoryMenu(false)}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.dropdownContainer,
          {
            position: "absolute",
            top: dropdownLayout.top,
            left: dropdownLayout.left,
            width: dropdownLayout.width,
          },
        ]}
      >
        <ScrollView
          style={{ maxHeight: 220 }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.id || cat.name}
              style={[
                styles.dropdownItem,
                index === categories.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => {
                setCategory(cat.name);
                setShowCategoryMenu(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderImageSourceModal = () => (
    <Modal visible={showImageSourceModal} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowImageSourceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sourceModalContainer}>
            <Text style={styles.modalTitle}>Select Image Source</Text>
            <TouchableOpacity
              style={styles.sourceOption}
              onPress={() => handleSelectImageSource("camera")}
            >
              <Camera color={theme.colors.primary} size={24} />
              <Text style={styles.sourceOptionText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sourceOption}
              onPress={() => handleSelectImageSource("gallery")}
            >
              <Plus color={theme.colors.primary} size={24} />
              <Text style={styles.sourceOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            {productImage && (
              <TouchableOpacity
                style={styles.sourceOption}
                onPress={() => handleSelectImageSource("remove")}
              >
                <Plus
                  color="#EF4444"
                  size={24}
                  style={{ transform: [{ rotate: "45deg" }] }}
                />
                <Text style={[styles.sourceOptionText, styles.destructiveText]}>
                  Remove Image
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalCancelButton,
                { marginTop: 8 },
              ]}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text
                style={[styles.modalButtonText, { color: theme.colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={loading || isUploading || isAIAnalyzing}
              >
                <ChevronLeft
                  color={
                    loading || isUploading || isAIAnalyzing
                      ? theme.colors.textSecondary
                      : isDarkMode
                        ? theme.colors.text
                        : "#1E293B"
                  }
                  size={28}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.title,
                  isDarkMode && { color: theme.colors.text },
                ]}
              >
                {isEditMode ? "Edit Product" : "Add Product"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.uploadContainer,
                (loading || isUploading || isAIAnalyzing) && { opacity: 0.5 },
              ]}
              activeOpacity={0.7}
              onPress={() => setShowImageSourceModal(true)}
              disabled={loading || isUploading || isAIAnalyzing}
            >
              {productImage ? (
                <Image
                  source={{ uri: productImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <View style={styles.uploadIcon}>
                    <Camera color="#FFFFFF" size={32} />
                  </View>
                  <Text
                    style={[
                      styles.uploadTitle,
                      isDarkMode && { color: theme.colors.text },
                    ]}
                  >
                    Upload Product Image
                  </Text>
                  <Text style={styles.uploadSubtitle}>
                    Tap to choose from gallery
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Product Name
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Greek Yogurt"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Barcode
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.05)"
                        : "#EFF7F2",
                    },
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Barcode will appear here"
                    placeholderTextColor="#94A3B8"
                    value={barcode}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Expiry Date
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrapper,
                    (loading || isUploading || isAIAnalyzing) && {
                      opacity: 0.5,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setDatePickerVisibility(true)}
                  disabled={loading || isUploading || isAIAnalyzing}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: expiryDate ? theme.colors.text : "#94A3B8",
                    }}
                  >
                    {expiryDate
                      ? dayjs(expiryDate).format("MMM D, YYYY")
                      : "Select expiry date"}
                  </Text>
                  <CalendarIcon size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    { marginTop: 10 },
                    (loading || isUploading || isAIAnalyzing) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={handleAIScanLabel}
                  disabled={loading || isUploading || isAIAnalyzing}
                >
                  {isAIAnalyzing ? (
                    <ActivityIndicator
                      color={theme.colors.primary}
                      size="small"
                    />
                  ) : (
                    <Camera color={theme.colors.primary} size={18} />
                  )}
                  <Text style={styles.secondaryButtonText}>
                    {isAIAnalyzing
                      ? "AI is Reading Label..."
                      : "AI Scan Label for Dates"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text
                    style={[
                      styles.label,
                      { marginBottom: 0 },
                      isDarkMode && { color: theme.colors.textSecondary },
                    ]}
                  >
                    Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddCategoryModal(true)}
                    disabled={loading || isUploading || isAIAnalyzing}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Plus color={theme.colors.primary} size={16} />
                    <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600', marginLeft: 4 }}>Add Category</Text>
                  </TouchableOpacity>
                </View>

                <View ref={categoryButtonRef} collapsable={false}>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      (loading || isUploading || isAIAnalyzing) && {
                        opacity: 0.5,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={toggleDropdown}
                    disabled={loading || isUploading || isAIAnalyzing}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: category ? theme.colors.text : "#94A3B8",
                      }}
                    >
                      {category || "Select category"}
                    </Text>
                    <ChevronDown size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Storage Location Picker */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Storage Zone
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.zoneScrollContainer}
                >
                  {[
                    { value: "fridge", label: "Fridge", icon: Thermometer, color: "#3B82F6" },
                    { value: "freezer", label: "Freezer", icon: Snowflake, color: "#06B6D4" },
                    { value: "pantry", label: "Pantry", icon: Package, color: "#F59E0B" },
                    { value: "medicine_box", label: "Medicine", icon: Activity, color: "#10B981" },
                    { value: "other", label: "Other", icon: HelpCircle, color: "#64748B" },
                  ].map((zone) => {
                    const isSelected = storageLocation === zone.value;
                    const Icon = zone.icon;
                    return (
                      <TouchableOpacity
                        key={zone.value}
                        style={[
                          styles.zoneChip,
                          isSelected && { borderColor: zone.color, backgroundColor: zone.color + "12" },
                        ]}
                        onPress={() => setStorageLocation(zone.value as any)}
                        activeOpacity={0.7}
                      >
                        <Icon size={16} color={isSelected ? zone.color : theme.colors.textSecondary} />
                        <Text
                          style={[
                            styles.zoneChipText,
                            isSelected && { color: zone.color, fontWeight: "900" },
                          ]}
                        >
                          {zone.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Ingredients
                </Text>
                <View style={[styles.inputWrapper, { minHeight: 80 }]}>
                  <TextInput
                    style={[styles.input, { paddingVertical: 12, height: '100%', textAlignVertical: 'center' }]}
                    placeholder="Enter ingredients (comma separated)"
                    placeholderTextColor="#94A3B8"
                    value={ingredients}
                    onChangeText={setIngredients}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.quantityLabel,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Quantity
                </Text>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => setQty(Math.max(1, qty - 1))}
                    activeOpacity={0.7}
                    disabled={loading || isUploading || isAIAnalyzing}
                  >
                    <Minus
                      size={24}
                      color={
                        loading || isUploading || isAIAnalyzing
                          ? theme.colors.textSecondary
                          : theme.colors.primary
                      }
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => setQty(qty + 1)}
                    activeOpacity={0.7}
                    disabled={loading || isUploading || isAIAnalyzing}
                  >
                    <Plus
                      size={24}
                      color={
                        loading || isUploading || isAIAnalyzing
                          ? theme.colors.textSecondary
                          : theme.colors.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode && { color: theme.colors.textSecondary },
                  ]}
                >
                  Notes (Optional)
                </Text>
                <View style={[styles.inputWrapper, styles.notesInput]}>
                  <TextInput
                    style={[styles.input, { height: "100%" }]}
                    placeholder="Add details, storage instructions, etc."
                    placeholderTextColor="#94A3B8"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              {!isEditMode && (
                <View style={styles.inputGroup}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 12, gap: 10 }}
                    onPress={() => setSaveAsTemplate(!saveAsTemplate)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: saveAsTemplate ? theme.colors.primary : theme.colors.border,
                        backgroundColor: saveAsTemplate ? theme.colors.primary : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {saveAsTemplate && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: "#FFF",
                          }}
                        />
                      )}
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.text }}>
                      Save as Staple for Quick Add
                    </Text>
                  </TouchableOpacity>

                  {saveAsTemplate && (
                    <View style={{ marginTop: 8 }}>
                      <Text
                        style={[
                          styles.label,
                          isDarkMode && { color: theme.colors.textSecondary },
                        ]}
                      >
                        Default Shelf Life (Days)
                      </Text>
                      <View style={styles.qtyContainer}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => setShelfLifeDays(Math.max(1, shelfLifeDays - 1))}
                          activeOpacity={0.7}
                        >
                          <Minus size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{shelfLifeDays}</Text>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => setShelfLifeDays(shelfLifeDays + 1)}
                          activeOpacity={0.7}
                        >
                          <Plus size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  name &&
                  expiryDate &&
                  category && { backgroundColor: theme.colors.primary },
                  loading && { opacity: 0.7 },
                ]}
                onPress={handleSave}
                disabled={loading || !name || !expiryDate || !category}
              >
                {loading || isUploading ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator color="#FFF" />
                    <Text style={{ color: "#FFF", marginLeft: 10 }}>
                      {isUploading ? "Uploading Image..." : "Saving..."}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.submitButtonText,
                      name && expiryDate && category && { color: "#FFF" },
                    ]}
                  >
                    {isEditMode ? "Update Product" : "Save Product"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          minimumDate={new Date()}
          themeVariant={isDarkMode ? "dark" : "light"}
        />
        {renderAddCategoryModal()}
        {renderCategoryDropdown()}
        {renderImageSourceModal()}
      </View>
    </Provider>
  );
}
