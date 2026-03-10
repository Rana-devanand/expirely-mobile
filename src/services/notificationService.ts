import { api } from "./api";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getNotifications: () =>
    api.get<{ success: boolean; data: Notification[] }>("/notifications"),

  markAsRead: (id: string) =>
    api.put<{ success: boolean; message: string }>(
      `/notifications/${id}/read`,
      {},
    ),

  markAllAsRead: () =>
    api.put<{ success: boolean; message: string }>(
      "/notifications/all-read",
      {},
    ),

  getAIExpiryMessages: async (
    productName: string,
    category?: string,
  ): Promise<any> => {
    const response = await api.post<{ success: boolean; data: any }>(
      "/notifications/generate-expiry-messages",
      { productName, category },
    );
    return response.data;
  },
};
