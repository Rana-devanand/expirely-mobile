import { Platform } from "react-native";
import { api } from "./api";
import { CONFIG } from "./config";
import axios from "axios";

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
  };
}

export const uploadService = {
  uploadProductImage: async (uri: string): Promise<UploadResponse> => {
    try {
      console.log("📸 [UploadService] Starting upload for URI:", uri);
      const formData = new FormData();

      // Normalize URI for Android (ensure it doesn't have double file:// and is correctly formatted)
      const cleanUri =
        Platform.OS === "android" ? uri.replace("file://", "") : uri;
      const finalUri = Platform.OS === "android" ? `file://${cleanUri}` : uri;

      console.log("📸 [UploadService] Normalized URI:", finalUri);

      // Extract file name and extension
      const filename = uri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image/jpeg`;

      // Standardize jpg to jpeg for mime type
      if (type === "image/jpg") type = "image/jpeg";

      console.log("📸 [UploadService] File details:", { filename, type });

      formData.append("image", {
        uri: finalUri,
        name: filename,
        type,
      } as any);

      const token = await (await import("./storage")).storage.getAccessToken();
      const uploadUrl = `${CONFIG.API_URL}/upload`;

      console.log("📸 [UploadService] Sending request to:", uploadUrl);

      const response = await axios.post<UploadResponse>(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📸 [UploadService] Response status:", response.status);
      console.log("📸 [UploadService] Response data:", response.data);

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || `Upload failed with status ${response.status}`,
        );
      }

      console.log("📸 [UploadService] Upload successful!");
      return response.data;
    } catch (error: any) {
      console.error("❌ [UploadService] Error:", error.message);
      throw error;
    }
  },
};
