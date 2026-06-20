import { api } from "./api";

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  activeUsers: number;
  expiringSoon: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  products: number;
  status: "Active" | "Blocked";
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  expiryDate: string;
  qty: number;
  imageUrl: string | null;
  status: string;
  addedBy: string;
  daysLeft: number | null;
  created_at: string;
}

export interface SystemLog {
  id: string;
  user_id: string | null;
  action: string;
  details: any;
  created_at: string;
  users?: {
    username: string | null;
    email: string;
  } | null;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<{ success: boolean; data: AdminStats }>("/dashboard/stats");
    return res.data;
  },

  getAllUsers: async (): Promise<AdminUser[]> => {
    const res = await api.get<{ success: boolean; data: AdminUser[] }>("/users");
    return res.data;
  },

  toggleUserStatus: async (
    userId: string,
    newStatus: "active" | "blocked",
  ): Promise<{ success: boolean; message: string }> => {
    return api.put<{ success: boolean; message: string }>(
      `/users/${userId}/status`,
      { status: newStatus },
    );
  },

  getAllProducts: async (): Promise<AdminProduct[]> => {
    const res = await api.get<{ success: boolean; data: AdminProduct[] }>("/products/admin");
    return res.data;
  },

  getSystemLogs: async (): Promise<SystemLog[]> => {
    const res = await api.get<{ success: boolean; data: SystemLog[] }>("/users/admin/logs");
    return res.data;
  },
};
