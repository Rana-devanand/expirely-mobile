import { api } from "./api";
import { HouseholdWithMembers, HouseholdMember } from "../types/household";

export const householdService = {
  /** Get the current user's household (or null) */
  getMyHousehold: async (): Promise<HouseholdWithMembers | null> => {
    const response = await api.get<{ success: boolean; data: HouseholdWithMembers | null }>("/households/me");
    return response.data;
  },

  /** Create a new household */
  createHousehold: async (name: string): Promise<HouseholdWithMembers> => {
    const response = await api.post<{ success: boolean; data: HouseholdWithMembers }>("/households", { name });
    return response.data;
  },

  /** Join a household using a join code */
  joinHousehold: async (joinCode: string): Promise<HouseholdWithMembers> => {
    const response = await api.post<{ success: boolean; data: HouseholdWithMembers }>("/households/join", { joinCode });
    return response.data;
  },

  /** Leave the current household */
  leaveHousehold: async (): Promise<void> => {
    await api.delete("/households/leave");
  },

  /** Get all members of the current household */
  getMembers: async (): Promise<HouseholdMember[]> => {
    const response = await api.get<{ success: boolean; data: HouseholdMember[] }>("/households/members");
    return response.data;
  },
};
