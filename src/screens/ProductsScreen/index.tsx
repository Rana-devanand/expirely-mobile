import React from "react";
import { View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useAppTheme } from "../../hooks/useAppTheme";
import { Package } from "lucide-react-native";
import ProductCard from "../../components/ProductCard";
import { getStyles } from "./styles";

export default function ProductsScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const products = useSelector((state: RootState) => state.products.products);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Products</Text>
        <Text style={styles.subtitle}>
          {products.length} items in your inventory
        </Text>
      </View>

      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Package size={64} color={theme.colors.border} />
          <Text style={styles.emptyText}>Your inventory is empty.</Text>
        </View>
      )}
    </View>
  );
}
