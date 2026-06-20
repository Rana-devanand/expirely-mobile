# Smart Shopping List

## Goal
Help users remember what to buy again when products are consumed, expired, or frequently used.

## User Value
- Reduces repeated manual typing.
- Turns inventory tracking into grocery planning.
- Makes the app useful before shopping.

## User Flow
1. User marks a product as used or expired.
2. App asks: "Add to shopping list?"
3. User can manage a Shopping List screen.
4. Frequently bought products appear as suggestions.

## Integration Plan
- Add a Shopping List tab or secondary screen from Home/Inventory.
- Store shopping list items locally first or in backend if multi-device sync is needed.
- Add quick actions from Product Detail and product cards.

## Data Needed
New model:

```ts
type ShoppingListItem = {
  id: string;
  name: string;
  category?: string;
  qty?: number;
  isChecked: boolean;
  sourceProductId?: string;
  createdAt: string;
};
```

## Screens To Update
- `ProductDetailScreen`
- `InventoryScreen`
- Optional: new `ShoppingListScreen`

## API Changes
Recommended backend endpoints:

```txt
GET    /shopping-list
POST   /shopping-list
PATCH  /shopping-list/:id
DELETE /shopping-list/:id
```

## Build Steps
1. Add shopping list slice/service in mobile app.
2. Create shopping list screen.
3. Add "Add to shopping list" after marking products used.
4. Add check/uncheck and delete actions.
5. Later: auto-suggest repeated items.

## Success Metric
Users use the app before grocery shopping, not only after buying products.
