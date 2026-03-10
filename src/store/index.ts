import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import uiReducer from "./uiSlice";
import authReducer from "./authSlice";
import categoryReducer from "./categorySlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    ui: uiReducer,
    auth: authReducer,
    category: categoryReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
