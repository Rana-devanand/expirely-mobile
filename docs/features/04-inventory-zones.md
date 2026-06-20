# Inventory Zones

## Goal
Let users organize products by where they are stored: fridge, freezer, pantry, medicine box, etc.

## User Value
- Makes large inventories easier to scan.
- Helps families find items faster.
- Supports better storage reminders.

## User Flow
1. User adds or edits a product.
2. User selects a storage zone.
3. Inventory screen can filter by zone.
4. Home screen can show urgent items grouped by zone.

## Integration Plan
- Add a `storageLocation` field to products.
- Add zone chips/filter tabs in Inventory.
- Add location selector in Add/Edit Product.

## Data Needed
Product field:

```ts
storageLocation?: "fridge" | "freezer" | "pantry" | "medicine_box" | "other";
```

Optional custom zones:

```ts
type InventoryZone = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
};
```

## Screens To Update
- `AddProductScreen`
- `InventoryScreen`
- `ProductDetailScreen`
- `HomeScreen`

## API Changes
Update product create/update payloads to include `storageLocation`.

Optional:

```txt
GET  /inventory-zones
POST /inventory-zones
```

## Build Steps
1. Add `storageLocation` to product types.
2. Add selector in Add Product form.
3. Update backend product schema.
4. Add zone filters on Inventory screen.
5. Show zone badge on product cards.

## Success Metric
Users can quickly answer: "Where is this item?"
