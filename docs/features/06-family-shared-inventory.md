# Family / Shared Inventory

## Goal
Allow multiple household members to manage the same inventory.

## User Value
- Makes the app useful for real homes, not just one person.
- Prevents duplicate purchases.
- Lets anyone add, consume, or update items.

## User Flow
1. User creates a household.
2. User invites family members.
3. Members share one inventory.
4. Activity history shows who added or used items.

## Integration Plan
- Add household/team ownership to products.
- Products belong to a household, not only a user.
- Use roles: owner, member.

## Data Needed
New models:

```ts
type Household = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
};

type HouseholdMember = {
  id: string;
  householdId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
};
```

Product field:

```ts
householdId?: string;
```

## Screens To Update
- `ProfileScreen`
- `HomeScreen`
- `InventoryScreen`
- Add invite/join household screens

## API Changes
Recommended endpoints:

```txt
POST /households
GET  /households/current
POST /households/invite
POST /households/join
GET  /households/members
```

## Build Steps
1. Add household tables.
2. Assign products to household.
3. Add invitation flow.
4. Filter all product queries by active household.
5. Add activity logs with user names.

## Success Metric
The app becomes a shared household tool instead of a personal tracker.
