import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProductUsageEvent, UsageState, UsageSummary } from "../types";
import { usageService, CreateProductUsageData } from "../services/usageService";

const initialState: UsageState = {
  logs: [],
  summary: null,
  loading: false,
  error: null,
};

// Async Thunks
export const logUsageEventAsync = createAsyncThunk(
  "usage/logEvent",
  async (
    { productId, data }: { productId: string; data: CreateProductUsageData },
    { rejectWithValue }
  ) => {
    try {
      return await usageService.logUsage(productId, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to log usage event");
    }
  }
);

export const fetchProductUsageEventsAsync = createAsyncThunk(
  "usage/fetchProductEvents",
  async (productId: string, { rejectWithValue }) => {
    try {
      return await usageService.getProductUsageLogs(productId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch usage logs");
    }
  }
);

export const fetchUsageSummaryAsync = createAsyncThunk(
  "usage/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await usageService.getUsageSummary();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch usage summary");
    }
  }
);

const usageSlice = createSlice({
  name: "usage",
  initialState,
  reducers: {
    clearLogs: (state) => {
      state.logs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Logs
      .addCase(fetchProductUsageEventsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductUsageEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchProductUsageEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Log Event
      .addCase(logUsageEventAsync.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      })
      .addCase(logUsageEventAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch Summary
      .addCase(fetchUsageSummaryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsageSummaryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchUsageSummaryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLogs } = usageSlice.actions;
export default usageSlice.reducer;
