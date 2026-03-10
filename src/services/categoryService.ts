import { api } from "./api";
import {
  Category,
  CreateCategoryData,
  CategoryResponse,
  CategoriesResponse,
} from "../types/category";

export const categoryService = {
  createCategory: async (
    data: CreateCategoryData,
  ): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>("/categories", data);
    return response;
  },

  getAllCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get<CategoriesResponse>("/categories");
    return response;
  },

  deleteCategory: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/categories/${id}`,
    );
    return response;
  },
};
