export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  avatar_url?: string;
  status: string;
  auth_provider: string;
  created_at: string;
  last_login?: string;
  daily_reminder_enabled?: boolean;
  daily_reminder_time?: string | null;
  daily_reminder_timezone?: string | null;
  last_daily_reminder_sent_at?: string | null;
}

export interface ReminderSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  timezone?: string;
  lastDailyReminderSentAt?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  google_id?: string;
  auth_provider: "credentials" | "google";
}

export interface SignUpData {
  username: string;
  email: string;
  password?: string;
}
