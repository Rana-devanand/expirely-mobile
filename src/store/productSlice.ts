import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Product, ProductState } from "../types";
import dayjs from "dayjs";
import { productService, CreateProductData } from "../services/productService";
import { ExpiryNotificationService } from "../services/ExpiryNotificationService";

const calculateStatus = (
  expiryDate: string,
): "good" | "warning" | "expired" => {
  const now = dayjs();
  const expiry = dayjs(expiryDate).endOf("day");
  if (expiry.isBefore(now)) return "expired";
  const daysLeft = expiry.diff(now, "day");
  if (daysLeft <= 3) return "warning";
  return "good";
};

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchProductsAsync = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const products = await productService.getAllProducts();
      const processedProducts = products.map((p) => {
        const now = dayjs();
        const expiry = dayjs(p.expiryDate).endOf("day");
        let daysLeft = expiry.diff(now, "day");
        if (expiry.isBefore(now)) {
          daysLeft = -1;
        }
        return {
          ...p,
          daysLeft,
          status: calculateStatus(p.expiryDate),
          created_at: p.created_at,
        };
      });

      return processedProducts;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  },
);

export const createProductAsync = createAsyncThunk(
  "products/createProduct",
  async (productData: CreateProductData, { rejectWithValue }) => {
    try {
      const newProduct = await productService.createProduct(productData);
      const now = dayjs();
      const expiry = dayjs(newProduct.expiryDate).endOf("day");
      let daysLeft = expiry.diff(now, "day");
      if (expiry.isBefore(now)) {
        daysLeft = -1;
      }
      const status = calculateStatus(newProduct.expiryDate);

      const result = {
        ...newProduct,
        daysLeft,
        status,
        barcode: newProduct.barcode || "N/A",
      };

      // Schedule notification for this new product
      await ExpiryNotificationService.scheduleExpiryNotifications(
        result as Product,
      );

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add product");
    }
  },
);

export const updateProductAsync = createAsyncThunk(
  "products/updateProduct",
  async (
    { id, data }: { id: string; data: Partial<CreateProductData> },
    { rejectWithValue },
  ) => {
    try {
      const updatedProduct = await productService.updateProduct(id, data);
      const now = dayjs();
      const expiry = dayjs(updatedProduct.expiryDate).endOf("day");
      let daysLeft = expiry.diff(now, "day");
      if (expiry.isBefore(now)) {
        daysLeft = -1;
      }
      const status = calculateStatus(updatedProduct.expiryDate);

      const result = {
        ...updatedProduct,
        daysLeft,
        status,
      };

      // Reschedule notifications for the updated product
      if (!result.isConsumed && dayjs(result.expiryDate).isAfter(dayjs())) {
        await ExpiryNotificationService.scheduleExpiryNotifications(
          result as Product,
        );
      } else {
        await ExpiryNotificationService.clearProductNotifications(result.id);
      }

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update product");
    }
  },
);

export const deleteProductAsync = createAsyncThunk(
  "products/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      await ExpiryNotificationService.clearProductNotifications(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete product");
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    clearProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload as Product);
      })
      .addCase(createProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload as Product[];
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.products[index] = action.payload as Product;
        }
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { removeProduct, clearProducts } = productSlice.actions;
export default productSlice.reducer;
