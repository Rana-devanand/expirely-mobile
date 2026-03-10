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
