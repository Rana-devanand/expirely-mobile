import { api } from "./api";

export interface CreateProductUsageData {
  type: "USED_FULLY" | "USED_PARTIALLY" | "WASTED";
  quantity?: number;
  note?: string;
}

export interface ProductUsageEvent {
  id: string;
  user_id: string;
  product_id: string;
  type: "USED_FULLY" | "USED_PARTIALLY" | "WASTED";
  quantity: number;
  note?: string;
  created_at: string;
}

export interface UsageSummary {
  consumedCount: number;
  wastedCount: number;
  totalCount: number;
  wasteRate: number;
  outcomeBreakdown: {
    USED_FULLY: number;
    USED_PARTIALLY: number;
    WASTED: number;
  };
  wastedByCategory: Array<{
    category: string;
    count: number;
  }>;
}

export const usageService = {
  logUsage: async (
    productId: string,
    data: CreateProductUsageData
  ): Promise<ProductUsageEvent> => {
    const response = await api.post<{ success: boolean; data: ProductUsageEvent }>(
      `/products/${productId}/usage`,
      data
    );
    return response.data;
  },

  getProductUsageLogs: async (productId: string): Promise<ProductUsageEvent[]> => {
    const response = await api.get<{ success: boolean; data: ProductUsageEvent[] }>(
      `/products/${productId}/usage`
    );
    return response.data || [];
  },

  getUsageSummary: async (): Promise<UsageSummary> => {
    const response = await api.get<{ success: boolean; data: UsageSummary }>(
      "/analytics/usage-summary"
    );
    return response.data;
  },
};
