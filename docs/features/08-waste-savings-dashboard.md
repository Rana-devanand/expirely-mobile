# Waste Savings Dashboard

## Goal
Show users how much food and money they saved by tracking products.

## User Value
- Gives motivation to keep using the app.
- Makes progress visible.
- Helps users understand waste patterns.

## User Flow
1. User marks products as used or wasted.
2. Dashboard shows:
   - Items saved this month
   - Items wasted
   - Estimated money saved
   - Most wasted categories
3. User can view weekly/monthly trends.

## Integration Plan
- Best when combined with Product Usage Tracker.
- Start with simple estimates from product status.
- Later improve with product price fields.

## Data Needed
Helpful product fields:

```ts
estimatedPrice?: number;
```

Usage events from Product Usage Tracker:

```ts
type ProductUsageEvent = {
  productId: string;
  type: "USED_FULLY" | "USED_PARTIALLY" | "WASTED";
  createdAt: string;
};
```

## Screens To Update
- Home dashboard summary
- Optional new Analytics screen
- Profile achievement summary

## API Changes
Recommended endpoint:

```txt
GET /analytics/waste-savings?period=month
```

Example response:

```ts
{
  savedItems: number;
  wastedItems: number;
  estimatedMoneySaved: number;
  mostWastedCategory: string;
}
```

## Build Steps
1. Add usage tracking or reuse consumed/expired product status.
2. Add analytics service on backend.
3. Add dashboard cards in Home.
4. Add trend chart later.
5. Add optional price input for better savings estimates.

## Success Metric
Users feel rewarded for using the app and understand where waste happens.
