# Recurring Products

## Goal
Allow users to quickly re-add common products they buy again and again.

## User Value
- Reduces repeated form filling.
- Makes the app feel faster for daily household staples.
- Encourages continued tracking.

## User Flow
1. User adds a common item like milk.
2. App remembers typical category, quantity, and shelf life.
3. Next time, user taps "Add again".
4. App pre-fills expiry date based on usual shelf life.

## Integration Plan
- Start by deriving recurring products from product history.
- Later add explicit "Save as recurring" templates.

## Data Needed
New model:

```ts
type RecurringProductTemplate = {
  id: string;
  name: string;
  category: string;
  defaultQty?: number;
  defaultShelfLifeDays: number;
  imageUrl?: string;
  lastAddedAt?: string;
};
```

## Screens To Update
- `AddProductScreen`
- `HomeScreen`
- `InventoryScreen`

## API Changes
Recommended endpoints:

```txt
GET    /recurring-products
POST   /recurring-products
PATCH  /recurring-products/:id
DELETE /recurring-products/:id
POST   /recurring-products/:id/add-product
```

## Build Steps
1. Add recurring templates table.
2. Add "Save as recurring" option after adding a product.
3. Add "Quick Add" section on Home.
4. Pre-fill Add Product form from template.
5. Track last added date.

## Success Metric
Users can add common grocery items in one or two taps.
