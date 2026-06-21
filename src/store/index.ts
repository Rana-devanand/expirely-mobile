import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import uiReducer from "./uiSlice";
import authReducer from "./authSlice";
import categoryReducer from "./categorySlice";
import notificationReducer from "./notificationSlice";
import shoppingReducer from "./shoppingSlice";
import usageReducer from "./usageSlice";
import recurringReducer from "./recurringSlice";
import householdReducer from "./householdSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    ui: uiReducer,
    auth: authReducer,
    category: categoryReducer,
    notifications: notificationReducer,
    shopping: shoppingReducer,
    usage: usageReducer,
    recurring: recurringReducer,
    household: householdReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

