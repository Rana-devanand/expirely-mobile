import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Category, CreateCategoryData } from "../types/category";
import { categoryService } from "../services/categoryService";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  },
);

export const createCategoryAsync = createAsyncThunk(
  "category/create",
  async (data: CreateCategoryData, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create category");
    }
  },
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.categories = action.payload;
        },
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Category
      .addCase(createCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createCategoryAsync.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.loading = false;
          state.categories.unshift(action.payload);
        },
      )
      .addCase(createCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;
