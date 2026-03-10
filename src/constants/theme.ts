export const LIGHT_THEME = {
  colors: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    primary: "#45D1A0", // FreshTrack matching teal
    secondary: "#6366F1",
    text: "#1E293B",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    glow: "rgba(69, 209, 160, 0.2)",
    expiringBg: "#FFF1F2",
    freshBg: "#ECFDF5",
    expiredBg: "#F1F5F9",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
  },
};

export const DARK_THEME = {
  colors: {
    background: "#0B0F19",
    card: "#151C2C",
    primary: "#45D1A0",
    secondary: "#818CF8",
    text: "#FFFFFF",
    textSecondary: "#94A3B8",
    border: "#1E293B",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    glow: "rgba(69, 209, 160, 0.3)",
    expiringBg: "#2D1A1E",
    freshBg: "#064E3B",
    expiredBg: "#1E293B",
  },
  spacing: LIGHT_THEME.spacing,
  borderRadius: LIGHT_THEME.borderRadius,
};

export type ThemeType = typeof LIGHT_THEME;
export const THEME = DARK_THEME; // Default until state is wired up
