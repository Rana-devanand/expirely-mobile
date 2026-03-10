import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isDarkMode: boolean;
  isOnboardingComplete: boolean;
}

const initialState: UIState = {
  isDarkMode: false, // Default to light mode as per 'Expirely' branding
  isOnboardingComplete: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    completeOnboarding: (state) => {
      state.isOnboardingComplete = true;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    resetUI: (state) => {
      state.isDarkMode = false;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  completeOnboarding,
  setOnboardingComplete,
  resetUI,
} = uiSlice.actions;
export default uiSlice.reducer;
