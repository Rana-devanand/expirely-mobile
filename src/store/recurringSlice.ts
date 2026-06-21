import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RecurringProductTemplate, RecurringState } from "../types";
import { recurringService, CreateTemplateData } from "../services/recurringService";

const initialState: RecurringState = {
  templates: [],
  loading: false,
  error: null,
};

export const fetchTemplatesAsync = createAsyncThunk(
  "recurring/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      return await recurringService.getTemplates();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch recurring templates");
    }
  }
);

export const createTemplateAsync = createAsyncThunk(
  "recurring/createTemplate",
  async (data: CreateTemplateData, { rejectWithValue }) => {
    try {
      return await recurringService.createTemplate(data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create recurring template");
    }
  }
);

export const updateTemplateAsync = createAsyncThunk(
  "recurring/updateTemplate",
  async ({ id, data }: { id: string; data: Partial<CreateTemplateData> }, { rejectWithValue }) => {
    try {
      return await recurringService.updateTemplate(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update recurring template");
    }
  }
);

export const deleteTemplateAsync = createAsyncThunk(
  "recurring/deleteTemplate",
  async (id: string, { rejectWithValue }) => {
    try {
      await recurringService.deleteTemplate(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete recurring template");
    }
  }
);

export const trackTemplateUsageAsync = createAsyncThunk(
  "recurring/trackTemplateUsage",
  async (id: string, { rejectWithValue }) => {
    try {
      await recurringService.trackTemplateAdded(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to track template usage");
    }
  }
);

const recurringSlice = createSlice({
  name: "recurring",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTemplatesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplatesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // create
      .addCase(createTemplateAsync.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })
      // update
      .addCase(updateTemplateAsync.fulfilled, (state, action) => {
        const index = state.templates.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      })
      // delete
      .addCase(deleteTemplateAsync.fulfilled, (state, action) => {
        state.templates = state.templates.filter((t) => t.id !== action.payload);
      })
      // track usage
      .addCase(trackTemplateUsageAsync.fulfilled, (state, action) => {
        const index = state.templates.findIndex((t) => t.id === action.payload);
        if (index !== -1) {
          state.templates[index].last_added_at = new Date().toISOString();
        }
      });
  },
});

export default recurringSlice.reducer;
