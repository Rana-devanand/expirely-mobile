# Product Usage Tracker

## Goal
Track whether products were fully used, partially used, or wasted.

## User Value
- Helps users understand real waste habits.
- Makes analytics more meaningful.
- Supports better reminders and product recommendations later.

## User Flow
1. User opens product detail.
2. Instead of only "Mark as Used", user can choose:
   - Used fully
   - Used partially
   - Wasted / expired
3. App records the usage event.
4. Dashboard shows waste patterns over time.

## Integration Plan
- Keep product status simple, but add usage events.
- Each usage event records the outcome and optional quantity.
- Analytics reads usage history instead of guessing from current product status.

## Data Needed
New model:

```ts
type ProductUsageEvent = {
  id: string;
  productId: string;
  type: "USED_FULLY" | "USED_PARTIALLY" | "WASTED";
  quantity?: number;
  note?: string;
  createdAt: string;
};
```

Optional product fields:

```ts
remainingQty?: number;
lastUsedAt?: string;
```

## Screens To Update
- `ProductDetailScreen`
- `ProductCard`
- Analytics / dashboard screens

## API Changes
Recommended endpoints:

```txt
POST /products/:id/usage
GET  /products/:id/usage
GET  /analytics/usage-summary
```

## Build Steps
1. Add usage modal with three clear options.
2. Save usage events in backend.
3. Update product quantity/status based on event type.
4. Show usage history in Product Detail.
5. Add monthly waste summary later.

## Success Metric
Users can see what they waste most and adjust shopping habits.
