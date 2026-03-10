import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Product } from "../types";
import dayjs from "dayjs";
import { notificationService } from "./notificationService";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const ExpiryNotificationService = {
  /**
   * Request permission for notifications.
   */
  requestPermission: async (): Promise<boolean> => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return false;
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("expiry-alerts", {
        name: "Expiry Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return true;
  },

  /**
   * Schedule notifications for a single product (Refined Schedule + Medicine Safety)
   */
  scheduleExpiryNotifications: async (product: Product) => {
    try {
      const expiryDate = dayjs(product.expiryDate).startOf("day");
      const createdAt = product.created_at
        ? dayjs(product.created_at)
        : dayjs();
      const isMedicine =
        product.category?.toLowerCase().includes("medicine") ||
        product.name.toLowerCase().includes("medicine");

      // Fetch AI generated messages
      let aiMessages;
      try {
        const response = await notificationService.getAIExpiryMessages(
          product.name,
          product.category,
        );
        aiMessages = response.data;
      } catch (e) {
        console.warn("AI Message fetch failed, using fallback", e);
      }

      // --- 1. Newly Added Reminder (8 PM on day of addition) ---
      const newlyAddedTrigger = createdAt.set("hour", 20).set("minute", 0);
      if (newlyAddedTrigger.isAfter(dayjs())) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "New Item Tracked! ✨",
            body: `You added ${product.name} to your inventory. We'll remind you before it expires!`,
            data: { productId: product.id },
            sound: true,
            ...(Platform.OS === "android" && product.imageUrl
              ? { attachments: [{ url: product.imageUrl } as any] }
              : {}),
          } as any,
          trigger: {
            date: newlyAddedTrigger.toDate(),
            channelId: "expiry-alerts",
          } as any,
        });
      }

      // --- 2. 7-Day Alert (2:00 PM) ---
      const trigger7Days = expiryDate
        .subtract(7, "day")
        .set("hour", 14)
        .set("minute", 0);
      if (trigger7Days.isAfter(dayjs())) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: aiMessages?.sevenDays?.title || "Upcoming Expiry 📅",
            body:
              aiMessages?.sevenDays?.body ||
              `${product.name} will expire in 1 week!`,
            data: { productId: product.id },
            sound: true,
            ...(Platform.OS === "android" && product.imageUrl
              ? { attachments: [{ url: product.imageUrl } as any] }
              : {}),
          } as any,
          trigger: {
            date: trigger7Days.toDate(),
            channelId: "expiry-alerts",
          } as any,
        });
      }

      // --- 3. 3-Day Alert (9:00 AM) ---
      const trigger3Days = expiryDate
        .subtract(3, "day")
        .set("hour", 9)
        .set("minute", 0);
      if (trigger3Days.isAfter(dayjs())) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: aiMessages?.threeDays?.title || "Expiry Warning ⚠️",
            body:
              aiMessages?.threeDays?.body ||
              `${product.name} expires in 3 days. Use it soon!`,
            data: { productId: product.id },
            sound: true,
            ...(Platform.OS === "android" && product.imageUrl
              ? { attachments: [{ url: product.imageUrl } as any] }
              : {}),
          } as any,
          trigger: {
            date: trigger3Days.toDate(),
            channelId: "expiry-alerts",
          } as any,
        });
      }

      // --- 4. Critical Medicine Alerts (1-day and Today) ---
      // For medicines, we MUST warn about side effects on the last days
      if (isMedicine) {
        const triggers = [
          {
            days: 1,
            hour: 9,
            key: "oneDay",
            fallbackTitle: "Medicine Alert 🚨",
            fallbackBody: `${product.name} expires tomorrow! Don't use it past expiry.`,
          },
          {
            days: 0,
            hour: 9,
            key: "today",
            fallbackTitle: "Expired Medicine ⚠️",
            fallbackBody: `${product.name} is now expired. Using it may cause side effects!`,
          },
        ];

        for (const t of triggers) {
          const trigger = expiryDate
            .subtract(t.days, "day")
            .set("hour", t.hour)
            .set("minute", 0);
          if (trigger.isAfter(dayjs())) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: aiMessages?.[t.key]?.title || t.fallbackTitle,
                body: aiMessages?.[t.key]?.body || t.fallbackBody,
                data: { productId: product.id },
                sound: true,
                ...(Platform.OS === "android" && product.imageUrl
                  ? { attachments: [{ url: product.imageUrl } as any] }
                  : {}),
              } as any,
              trigger: {
                date: trigger.toDate(),
                channelId: "expiry-alerts",
              } as any,
            });
          }
        }
      }
    } catch (error) {
      console.error(
        "Failed to schedule notifications for product:",
        product.id,
        error,
      );
    }
  },

  /**
   * Reschedule all notifications for all products
   */
  rescheduleAll: async (products: Product[]) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const product of products) {
        if (
          !product.isConsumed &&
          dayjs(product.expiryDate).isAfter(dayjs().subtract(1, "day"))
        ) {
          await ExpiryNotificationService.scheduleExpiryNotifications(product);
        }
      }
      console.log(`Rescheduled alerts for active products`);
    } catch (error) {
      console.error("Failed to reschedule all notifications:", error);
    }
  },
};
