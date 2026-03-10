/**
 * Returns the initials of a name (max 2 characters)
 * e.g. "Devanand Rana" -> "DR", "John" -> "J"
 */
export const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  return (
    parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)
  ).toUpperCase();
};
