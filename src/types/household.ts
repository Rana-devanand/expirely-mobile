export interface Household {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: "OWNER" | "MEMBER";
  joined_at: string;
  username?: string;
  avatar_url?: string;
}

export interface HouseholdWithMembers extends Household {
  members: HouseholdMember[];
}

export interface HouseholdState {
  household: HouseholdWithMembers | null;
  loading: boolean;
  error: string | null;
}
