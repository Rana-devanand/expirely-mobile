# Simple Daily Reminder

## Goal
Send one useful daily reminder about products that need attention.

## User Value
- Brings users back before items expire.
- Makes the app useful even when users forget to open it.
- Reduces food waste with minimal effort.

## User Flow
1. User enables daily reminders.
2. User chooses reminder time.
3. App sends a concise notification:
   "2 items need attention today: Yogurt and Tomatoes."
4. Tapping notification opens Today's Actions.

## Integration Plan
- Use existing notification infrastructure.
- Add reminder preference fields.
- Reuse the Today Action List logic for notification content.

## Data Needed
User preference fields:

```ts
dailyReminderEnabled: boolean;
dailyReminderTime: string;
timezone?: string;
```

Optional:

```ts
lastDailyReminderSentAt?: string;
```

## Screens To Update
- `ProfileScreen` or Settings screen
- `HomeScreen`
- Notification handling entry point

## API Changes
Recommended endpoints:

```txt
PATCH /users/reminder-settings
GET   /users/reminder-settings
```

Backend worker:
- Query users with reminders enabled.
- Find products expiring today or soon.
- Send one grouped notification.

## Build Steps
1. Add reminder settings UI.
2. Save reminder preference in backend.
3. Add backend scheduler/worker job.
4. Use FCM/expo notifications to send reminder.
5. Deep link notification to Home screen.

## Success Metric
Users receive one helpful reminder per day and act on expiring items.
