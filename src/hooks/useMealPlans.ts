import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek } from "date-fns";

export interface MealPlan {
  id: string;
  household_code: string;
  week_start_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string | null;
  day_of_week: number;
  meal_type: string;
  custom_meal_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface MealPlanItemWithRecipe extends MealPlanItem {
  recipes?: {
    id: string;
    title: string;
    image_url: string | null;
    prep_time: number | null;
    cook_time: number | null;
  } | null;
}

export interface MealPlanInsert {
  household_code: string;
  week_start_date: string;
}

export interface MealPlanItemInsert {
  meal_plan_id: string;
  recipe_id?: string | null;
  day_of_week: number;
  meal_type: string;
  custom_meal_name?: string | null;
  notes?: string | null;
}

// Get or create meal plan for a week
export function useMealPlan(householdCode: string, weekStartDate: Date) {
  const weekStart = format(
    startOfWeek(weekStartDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );

  return useQuery({
    queryKey: ["meal_plan", householdCode, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("household_code", householdCode)
        .eq("week_start_date", weekStart)
        .maybeSingle();

      if (error) throw error;
      return data as MealPlan | null;
    },
    enabled: !!householdCode,
  });
}

// Fetch meal plan items for a plan
export function useMealPlanItems(mealPlanId: string | undefined) {
  return useQuery({
    queryKey: ["meal_plan_items", mealPlanId],
    queryFn: async () => {
      if (!mealPlanId) return [];

      const { data, error } = await supabase
        .from("meal_plan_items")
        .select(
          `
          *,
          recipes (
            id,
            title,
            image_url,
            prep_time,
            cook_time
          )
        `
        )
        .eq("meal_plan_id", mealPlanId);

      if (error) throw error;
      return data as MealPlanItemWithRecipe[];
    },
    enabled: !!mealPlanId,
  });
}

// Create a meal plan
export function useCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: MealPlanInsert) => {
      const { data, error } = await supabase
        .from("meal_plans")
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data as MealPlan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["meal_plan", data.household_code],
      });
    },
  });
}

// Add meal plan item
export function useAddMealPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: MealPlanItemInsert) => {
      const { data, error } = await supabase
        .from("meal_plan_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as MealPlanItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["meal_plan_items", data.meal_plan_id],
      });
    },
  });
}

// Update meal plan item
export function useUpdateMealPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MealPlanItem>;
    }) => {
      const { data, error } = await supabase
        .from("meal_plan_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MealPlanItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["meal_plan_items", data.meal_plan_id],
      });
    },
  });
}

// Delete meal plan item
export function useDeleteMealPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      mealPlanId,
    }: {
      id: string;
      mealPlanId: string;
    }) => {
      const { error } = await supabase
        .from("meal_plan_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return mealPlanId;
    },
    onSuccess: (mealPlanId) => {
      queryClient.invalidateQueries({
        queryKey: ["meal_plan_items", mealPlanId],
      });
    },
  });
}
