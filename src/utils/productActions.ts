import { Product } from "../types";
import dayjs from "dayjs";

export type ActionType = "EXPIRED" | "USE_TODAY" | "FREEZE_SUGGESTION" | "EXPIRING_WEEK";

export interface ProductAction {
  id: string; // Action ID (product ID)
  productId: string;
  type: ActionType;
  title: string;
  subtitle: string;
  product: Product;
}

export const generateProductActions = (
  products: Product[],
  dismissedIds: string[]
): ProductAction[] => {
  const actions: ProductAction[] = [];
  const dismissedSet = new Set(dismissedIds);

  const activeProducts = products.filter(
    (p) => !p.isConsumed && !dismissedSet.has(p.id)
  );

  for (const product of activeProducts) {
    const daysLeft = product.daysLeft;

    if (daysLeft === undefined) continue;

    const formattedDate = dayjs(product.expiryDate).format("MMM D");

    // 1. Expired items
    if (daysLeft < 0) {
      actions.push({
        id: product.id,
        productId: product.id,
        type: "EXPIRED",
        title: `"${product.name}" is expired`,
        subtitle: `Expired on ${formattedDate}. Discard or check item safety.`,
        product,
      });
      continue; // An item can only have one primary action
    }

    // 2. Use today / very soon (0 to 2 days left)
    if (daysLeft <= 2) {
      const dayLabel = daysLeft === 0 ? "today" : daysLeft === 1 ? "tomorrow" : "in 2 days";
      actions.push({
        id: product.id,
        productId: product.id,
        type: "USE_TODAY",
        title: `Use "${product.name}"`,
        subtitle: `Expires ${dayLabel} (${formattedDate}). Use it before it goes bad!`,
        product,
      });
      continue;
    }

    // 3. Freezer suggestions (1 to 4 days left, specific categories)
    const category = (product.category || "").toLowerCase();
    const isFreezable = ["meat", "bakery", "vegetables", "poultry", "fish"].includes(category);
    if (daysLeft >= 1 && daysLeft <= 4 && isFreezable) {
      actions.push({
        id: product.id,
        productId: product.id,
        type: "FREEZE_SUGGESTION",
        title: `Freeze "${product.name}"?`,
        subtitle: `Extend its shelf life by moving it to the freezer.`,
        product,
      });
      continue;
    }

    // 4. Expiring this week (3 to 7 days left)
    if (daysLeft <= 7) {
      actions.push({
        id: product.id,
        productId: product.id,
        type: "EXPIRING_WEEK",
        title: `"${product.name}" expiring`,
        subtitle: `Expires in ${daysLeft} days on ${formattedDate}.`,
        product,
      });
    }
  }

  // Sort actions: EXPIRED first, then USE_TODAY, then FREEZE_SUGGESTION, then EXPIRING_WEEK
  const priorityOrder: Record<ActionType, number> = {
    EXPIRED: 1,
    USE_TODAY: 2,
    FREEZE_SUGGESTION: 3,
    EXPIRING_WEEK: 4,
  };

  const sortedActions = actions.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

  return sortedActions;
};
