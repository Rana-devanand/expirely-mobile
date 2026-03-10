import { api } from "./api";
import { Product } from "../types";

export interface CreateProductData {
  name: string;
  barcode?: string;
  expiryDate: string;
  category: string;
  imageUrl?: string;
  notes?: string;
  color?: string;
  qty?: number;
  isConsumed?: boolean;
}

const mapBackendToProduct = (data: any): Product => {
  return {
    ...data,
    isConsumed: data.is_consumed ?? data.isConsumed,
  };
};

export const productService = {
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const payload = {
      ...data,
      is_consumed: data.isConsumed,
    };
    const response = await api.post<{
      success: boolean;
      data: any;
      message: string;
    }>("/products", payload);
    return mapBackendToProduct(response.data);
  },

  updateProduct: async (
    id: string,
    data: Partial<CreateProductData>,
  ): Promise<Product> => {
    const payload = {
      ...data,
      is_consumed: data.isConsumed,
    };
    const response = await api.put<{
      success: boolean;
      data: any;
      message: string;
    }>(`/products/${id}`, payload);
    return mapBackendToProduct(response.data);
  },

  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get<{ success: boolean; data: any[] }>(
      "/products",
    );
    return (response.data || []).map(mapBackendToProduct);
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<{ success: boolean; data: any }>(
      `/products/${id}`,
    );
    return mapBackendToProduct(response.data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  fetchByBarcode: async (code: string): Promise<any> => {
    const response = await api.get<{ success: boolean; data: any }>(
      `/products/barcode/${code}`,
    );
    return response.data;
  },

  extractDatesFromImage: async (base64Image: string): Promise<any> => {
    const response = await api.post<{ success: boolean; data: any }>(
      "/products/extract-dates",
      { image: base64Image },
    );
    return response.data;
  },
};
