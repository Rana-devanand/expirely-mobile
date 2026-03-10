export interface Category {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  icon?: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}
