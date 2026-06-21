import { api } from "./api";
import { ShoppingListItem } from "../types";

export interface CreateShoppingItemData {
  name: string;
  category?: string;
  qty?: number;
  quantity?: number;
  isChecked?: boolean;
  is_checked?: boolean;
  sourceProductId?: string;
  source_product_id?: string;
}

export const shoppingService = {
  getAllItems: async (): Promise<ShoppingListItem[]> => {
    const response = await api.get<{ success: boolean; data: ShoppingListItem[] }>(
      "/shopping-list"
    );
    return response.data || [];
  },

  createItem: async (data: CreateShoppingItemData): Promise<ShoppingListItem> => {
    const response = await api.post<{ success: boolean; data: ShoppingListItem }>(
      "/shopping-list",
      data
    );
    return response.data;
  },

  updateItem: async (
    id: string,
    data: Partial<CreateShoppingItemData>
  ): Promise<ShoppingListItem> => {
    const response = await api.put<{ success: boolean; data: ShoppingListItem }>(
      `/shopping-list/${id}`,
      data
    );
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/shopping-list/${id}`);
  },

  clearCheckedItems: async (): Promise<void> => {
    await api.post<{ success: boolean }>("/shopping-list/clear-checked", {});
  },
};
