import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "familjekalendern_session";

export interface HouseholdSession {
  householdId: string;
  householdCode: string;
  householdName: string;
}

export const getSession = (): HouseholdSession | null => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
};

export const setSession = (session: HouseholdSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const login = async (
  householdCode: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: HouseholdSession }> => {
  try {
    // Check if household exists
    const { data: household, error } = await supabase
      .from("households")
      .select("id, household_code, household_name, password_hash")
      .eq("household_code", householdCode.toUpperCase())
      .single();

    if (error || !household) {
      return { success: false, error: "Hushållskoden finns inte" };
    }

    // Simple password comparison (in production, use proper hashing)
    if (household.password_hash !== password) {
      return { success: false, error: "Fel lösenord" };
    }

    const session: HouseholdSession = {
      householdId: household.id,
      householdCode: household.household_code,
      householdName: household.household_name || "Min Familj",
    };

    setSession(session);
    return { success: true, session };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Något gick fel. Försök igen." };
  }
};

export const register = async (
  householdCode: string,
  password: string,
  householdName?: string
): Promise<{ success: boolean; error?: string; session?: HouseholdSession }> => {
  try {
    const { data: household, error } = await supabase
      .from("households")
      .insert({
        household_code: householdCode.toUpperCase(),
        password_hash: password,
        household_name: householdName || "Min Familj",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Denna hushållskod används redan" };
      }
      return { success: false, error: "Kunde inte skapa hushåll" };
    }

    const session: HouseholdSession = {
      householdId: household.id,
      householdCode: household.household_code,
      householdName: household.household_name || "Min Familj",
    };

    setSession(session);
    return { success: true, session };
  } catch (err) {
    console.error("Register error:", err);
    return { success: false, error: "Något gick fel. Försök igen." };
  }
};

export const logout = (): void => {
  clearSession();
};

export const updateHouseholdName = (name: string): void => {
  const session = getSession();
  if (session) {
    session.householdName = name;
    setSession(session);
  }
};
