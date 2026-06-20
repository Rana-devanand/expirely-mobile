import dayjs from "dayjs";

/**
 * Returns a time-based greeting for the day
 * @returns {string} One of: Good morning, Good afternoon, Good evening, Good night
 */
export const getTimeBasedGreeting = (): string => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Good afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

/**
 * Formats the remaining time for a product's expiry date.
 * If less than 24 hours (1 day) is left, it shows exact hours and minutes.
 * @param expiryDate Expiry date string
 * @param short Whether to use short formatting (e.g. '12h 30m', '3d')
 */
export const formatRemainingTime = (expiryDate: string, short: boolean = false): string => {
  if (!expiryDate) return "N/A";

  const now = dayjs();
  const expiry = dayjs(expiryDate).endOf("day");
  const diffMinutes = expiry.diff(now, "minute");

  if (diffMinutes <= 0) {
    return "Expired";
  }

  // Less than 24 hours left (1440 minutes)
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0) {
      return short ? `${hours}h ${mins}m` : `${hours}h ${mins}m left`;
    }
    return short ? `${mins}m` : `${mins}m left`;
  }

  // 1 day or more left
  const days = Math.round(diffMinutes / 1440);
  const displayDays = days <= 0 ? 1 : days;
  return short ? `${displayDays}d` : `${displayDays} ${displayDays === 1 ? "day" : "days"} left`;
};

