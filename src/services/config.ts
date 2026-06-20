import { Platform } from "react-native";

const DEFAULT_LOCAL_URL =
  Platform.OS === "android" ? "http://10.122.225.83:5000" : "http://localhost:5000";
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL_LOCAL || DEFAULT_LOCAL_URL).trim().replace(/\/+$/, "");

const API_URL = `${BASE_URL}/api`;

export const CONFIG = {
  API_URL,
  TIMEOUT: 10000,
};
