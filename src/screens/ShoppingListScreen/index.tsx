import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Minus,
} from "lucide-react-native";
import {
  fetchShoppingListAsync,
  addShoppingListItemAsync,
  toggleShoppingListItemAsync,
  updateShoppingListItemQtyAsync,
  deleteShoppingListItemAsync,
  clearCheckedShoppingItemsAsync,
} from "../../store/shoppingSlice";
import { getStyles } from "./styles";
import { Product, ShoppingListItem } from "../../types";
import { toast } from "../../utils/toast";

const getEmoji = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "dairy":
      return "🥛";
    case "fruit":
      return "🍓";
    case "meat":
      return "🍗";
    case "beverage":
      return "🧃";
    case "bakery":
      return "🍞";
    case "vegetables":
      return "🥦";
    default:
      return "📦";
  }
};

export default function ShoppingListScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  const { items, loading } = useSelector((state: RootState) => state.shopping);
  const { products } = useSelector((state: RootState) => state.products);
  
  const [showCompleted, setShowCompleted] = useState(true);
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    dispatch(
      addShoppingListItemAsync({
        name: newItemName.trim(),
        qty: 1,
      })
    );
    toast.success("Product added");
    setNewItemName("");
  };

  React.useEffect(() => {
    dispatch(fetchShoppingListAsync());
  }, [dispatch]);

  const activeItems = items.filter((item) => !item.isChecked);
  const completedItems = items.filter((item) => item.isChecked);



  const handleToggleItem = (id: string, isChecked: boolean) => {
    dispatch(toggleShoppingListItemAsync({ id, isChecked }));
  };

  const handleQtyChange = (id: string, currentQty: number, change: number) => {
    const newQty = Math.max(1, currentQty + change);
    if (newQty !== currentQty) {
      dispatch(updateShoppingListItemQtyAsync({ id, qty: newQty }));
    }
  };

  const handleDeleteItem = (id: string) => {
    dispatch(deleteShoppingListItemAsync(id));
  };

  const handleClearChecked = () => {
    dispatch(clearCheckedShoppingItemsAsync());
  };

  // Find product image or category emoji
  const getProductImage = (item: ShoppingListItem) => {
    if (item.sourceProductId) {
      const prod = products.find((p) => p.id === item.sourceProductId);
      if (prod?.imageUrl) return prod.imageUrl;
    }
    // Also check if any active/expired product matches the name exactly
    const matchedProduct = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
    return matchedProduct?.imageUrl || null;
  };

  const getProductEmoji = (item: ShoppingListItem) => {
    if (item.sourceProductId) {
      const prod = products.find((p) => p.id === item.sourceProductId);
      if (prod?.category) return getEmoji(prod.category);
    }
    const matchedProduct = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
    return getEmoji(item.category || matchedProduct?.category || "");
  };

  const styles = getStyles(theme, isDarkMode);

  const renderShoppingItem = (item: ShoppingListItem) => {
    const imageUrl = getProductImage(item);
    const emoji = getProductEmoji(item);

    return (
      <View key={item.id} style={styles.itemCard}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, item.isChecked && styles.checkboxChecked]}
          activeOpacity={0.7}
          onPress={() => handleToggleItem(item.id, !item.isChecked)}
        >
          {item.isChecked && <Check size={14} color="#FFF" strokeWidth={3} />}
        </TouchableOpacity>

        {/* Thumbnail Image / Emoji */}
        <View style={styles.productThumbContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productThumb} resizeMode="cover" />
          ) : (
            <Text style={styles.productEmoji}>{emoji}</Text>
          )}
        </View>

        {/* Name & Metadata */}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, item.isChecked && styles.itemCheckedName]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.category && (
            <View style={styles.itemMeta}>
              <Text style={styles.itemCategory}>{item.category}</Text>
              {item.sourceProductId && <Text style={styles.itemTag}>Auto-added</Text>}
            </View>
          )}
        </View>

        {/* Quantity Controls (Hide if checked) */}
        {!item.isChecked && (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQtyChange(item.id, item.qty, -1)}
            >
              <Minus size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQtyChange(item.id, item.qty, 1)}
            >
              <Plus size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteItem(item.id)}>
          <Trash2 size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Shopping List</Text>
              {activeItems.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{activeItems.length}</Text>
                </View>
              )}
            </View>

            {completedItems.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearChecked}>
                <Text style={styles.clearButtonText}>Clear Checked</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Manual Add Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Add item manually..."
                placeholderTextColor={theme.colors.textSecondary}
                value={newItemName}
                onChangeText={setNewItemName}
                onSubmitEditing={handleAddItem}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions Card */}
          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <ShoppingCart size={18} color={theme.colors.primary} />
              <Text style={styles.instructionTitle}>Smart Grocery Assistant</Text>
            </View>
            <Text style={styles.instructionText}>
              This list helps you track groceries dynamically. It automatically builds itself as you manage your pantry:
            </Text>
            <View style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Mark items as <Text style={styles.boldText}>Used</Text> or <Text style={styles.boldText}>Expired</Text> in your stock list.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Check items off as you buy them at the grocery store.
              </Text>
            </View>
          </View>

          {/* Loading Indicator */}
          {loading && items.length === 0 && (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
          )}

          {/* Empty State */}
          {items.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <ShoppingCart size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
              <Text style={styles.emptyText}>
                Use suggestions above or mark products as consumed/expired in your inventory to automatically build your shopping list!
              </Text>
            </View>
          )}

          {/* Active Items */}
          {activeItems.length > 0 && (
            <View>
              <Text style={styles.listHeader}>Buy Items</Text>
              <View style={styles.listContainer}>
                {activeItems.map((item) => renderShoppingItem(item))}
              </View>
            </View>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <View>
              <TouchableOpacity
                style={styles.completedListHeader}
                activeOpacity={0.8}
                onPress={() => setShowCompleted(!showCompleted)}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.completedHeaderTitle}>Completed</Text>
                  <Text style={styles.completedCount}>({completedItems.length})</Text>
                </View>
                {showCompleted ? (
                  <ChevronUp size={16} color={theme.colors.textSecondary} />
                ) : (
                  <ChevronDown size={16} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>

              {showCompleted && (
                <View style={styles.listContainer}>
                  {completedItems.map((item) => renderShoppingItem(item))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
