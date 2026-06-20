# Today / This Week Action List

## Goal
Give users a quick daily answer to: "What should I use, move, or check today?"

## User Value
- Makes the app useful in under 20 seconds.
- Helps users reduce waste without manually checking the full inventory.
- Creates a natural daily habit.

## User Flow
1. User opens the Home screen.
2. A "Today's Actions" section shows priority tasks:
   - Use today
   - Expiring this week
   - Move to freezer
   - Check expired items
3. User taps an item to open details or mark it as used.

## Integration Plan
- Add a `TodaysActions` component on HomeScreen.
- Derive actions from existing product fields:
  - `daysLeft <= 0`: urgent / expired
  - `daysLeft <= 2`: use today
  - `daysLeft <= 7`: expiring this week
  - category-based freezer suggestions for meat, bakery, and some vegetables.
- Keep the first version fully client-side.

## Data Needed
No new database fields required for v1.

Optional later fields:
- `lastActionDismissedAt`
- `preferredAction`
- `storageLocation`

## Screens To Update
- `HomeScreen`
- `ProductDetailScreen`

## API Changes
None for v1.

## Build Steps
1. Create `src/components/TodaysActions.tsx`.
2. Add action-generation helper in `src/utils/productActions.ts`.
3. Render the section near the top of HomeScreen.
4. Add quick actions: `Mark Used`, `View`, `Dismiss`.

## Success Metric
Users open the app daily because the first screen immediately tells them what to do.
