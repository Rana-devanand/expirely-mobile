import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { HouseholdState, HouseholdWithMembers } from "../types/household";
import { householdService } from "../services/householdService";

const initialState: HouseholdState = {
  household: null,
  loading: false,
  error: null,
};

export const fetchMyHouseholdAsync = createAsyncThunk(
  "household/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      return await householdService.getMyHousehold();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load household");
    }
  }
);

export const createHouseholdAsync = createAsyncThunk(
  "household/create",
  async (name: string, { rejectWithValue }) => {
    try {
      return await householdService.createHousehold(name);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create household");
    }
  }
);

export const joinHouseholdAsync = createAsyncThunk(
  "household/join",
  async (joinCode: string, { rejectWithValue }) => {
    try {
      return await householdService.joinHousehold(joinCode);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to join household");
    }
  }
);

export const leaveHouseholdAsync = createAsyncThunk(
  "household/leave",
  async (_, { rejectWithValue }) => {
    try {
      await householdService.leaveHousehold();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to leave household");
    }
  }
);

const householdSlice = createSlice({
  name: "household",
  initialState,
  reducers: {
    clearHousehold: (state) => {
      state.household = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchMyHouseholdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyHouseholdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.household = action.payload;
      })
      .addCase(fetchMyHouseholdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // create
      .addCase(createHouseholdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHouseholdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.household = action.payload;
      })
      .addCase(createHouseholdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // join
      .addCase(joinHouseholdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinHouseholdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.household = action.payload;
      })
      .addCase(joinHouseholdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // leave
      .addCase(leaveHouseholdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveHouseholdAsync.fulfilled, (state) => {
        state.loading = false;
        state.household = null;
      })
      .addCase(leaveHouseholdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearHousehold } = householdSlice.actions;
export default householdSlice.reducer;
