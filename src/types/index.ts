export interface Product {
  id: string;
  name: string;
  barcode?: string;
  expiryDate: string;
  category: string;
  imageUrl?: string;
  daysLeft: number;
  status: "good" | "warning" | "expired";
  color?: string;
  qty?: number;
  progress?: number;
  notes?: string;
  ingredients?: string;
  isConsumed?: boolean;
  created_at?: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}
