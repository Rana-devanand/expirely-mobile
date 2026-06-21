import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ShoppingListItem, ShoppingListState } from "../types";
import { shoppingService, CreateShoppingItemData } from "../services/shoppingService";

const initialState: ShoppingListState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchShoppingListAsync = createAsyncThunk(
  "shopping/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      return await shoppingService.getAllItems();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch shopping list");
    }
  }
);

export const addShoppingListItemAsync = createAsyncThunk(
  "shopping/addItem",
  async (itemData: CreateShoppingItemData, { rejectWithValue }) => {
    try {
      return await shoppingService.createItem(itemData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add shopping item");
    }
  }
);

export const toggleShoppingListItemAsync = createAsyncThunk(
  "shopping/toggleItem",
  async (
    { id, isChecked }: { id: string; isChecked: boolean },
    { rejectWithValue },
  ) => {
    try {
      return await shoppingService.updateItem(id, { isChecked });
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update shopping item");
    }
  }
);

export const updateShoppingListItemQtyAsync = createAsyncThunk(
  "shopping/updateQty",
  async (
    { id, qty }: { id: string; qty: number },
    { rejectWithValue },
  ) => {
    try {
      return await shoppingService.updateItem(id, { qty });
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update item quantity");
    }
  }
);

export const deleteShoppingListItemAsync = createAsyncThunk(
  "shopping/deleteItem",
  async (id: string, { rejectWithValue }) => {
    try {
      await shoppingService.deleteItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete shopping item");
    }
  }
);

export const clearCheckedShoppingItemsAsync = createAsyncThunk(
  "shopping/clearChecked",
  async (_, { rejectWithValue }) => {
    try {
      await shoppingService.clearCheckedItems();
      return;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to clear checked items");
    }
  }
);

const shoppingSlice = createSlice({
  name: "shopping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingListAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShoppingListAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchShoppingListAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addShoppingListItemAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addShoppingListItemAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(toggleShoppingListItemAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].isChecked = action.payload.isChecked;
        }
      })
      .addCase(toggleShoppingListItemAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateShoppingListItemQtyAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].qty = action.payload.qty;
        }
      })
      .addCase(updateShoppingListItemQtyAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteShoppingListItemAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteShoppingListItemAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(clearCheckedShoppingItemsAsync.fulfilled, (state) => {
        state.items = state.items.filter((item) => !item.isChecked);
      })
      .addCase(clearCheckedShoppingItemsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default shoppingSlice.reducer;
