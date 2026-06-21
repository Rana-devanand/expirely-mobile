import { api } from "./api";
import { RecurringProductTemplate } from "../types";

export interface CreateTemplateData {
  name: string;
  category: string;
  default_qty?: number;
  default_shelf_life_days: number;
  image_url?: string;
}

export const recurringService = {
  getTemplates: async (): Promise<RecurringProductTemplate[]> => {
    const response = await api.get<{ success: boolean; data: RecurringProductTemplate[] }>("/recurring-products");
    return response.data;
  },

  createTemplate: async (data: CreateTemplateData): Promise<RecurringProductTemplate> => {
    const response = await api.post<{ success: boolean; data: RecurringProductTemplate }>("/recurring-products", data);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<CreateTemplateData>): Promise<RecurringProductTemplate> => {
    const response = await api.patch<{ success: boolean; data: RecurringProductTemplate }>(`/recurring-products/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/recurring-products/${id}`);
  },

  trackTemplateAdded: async (id: string): Promise<void> => {
    await api.post(`/recurring-products/${id}/add`, {});
  }
};
