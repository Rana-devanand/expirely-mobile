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
  remainingQty?: number;
  lastUsedAt?: string;
  progress?: number;
  notes?: string;
  ingredients?: string;
  isConsumed?: boolean;
  storageLocation?: "fridge" | "freezer" | "pantry" | "medicine_box" | "other";
  created_at?: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  name: string;
  category?: string;
  qty: number;
  isChecked: boolean;
  sourceProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListState {
  items: ShoppingListItem[];
  loading: boolean;
  error: string | null;
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

export interface UsageState {
  logs: ProductUsageEvent[];
  summary: UsageSummary | null;
  loading: boolean;
  error: string | null;
}

export interface RecurringProductTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  default_qty: number;
  default_shelf_life_days: number;
  image_url?: string;
  last_added_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringState {
  templates: RecurringProductTemplate[];
  loading: boolean;
  error: string | null;
}

