import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Budget {
  id: string;
  event_id: string;
  total_budget: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  category: string;
  description: string | null;
  estimated_cost: number;
  actual_cost: number;
  paid: boolean;
  created_at: string;
  updated_at: string;
}

export const useEventBudget = (eventId: string) => {
  return useQuery({
    queryKey: ["budget", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data as Budget | null;
    },
    enabled: !!eventId,
  });
};

export const useBudgetItems = (budgetId: string | undefined) => {
  return useQuery({
    queryKey: ["budget_items", budgetId],
    queryFn: async () => {
      if (!budgetId) return [];
      const { data, error } = await supabase
        .from("budget_items")
        .select("*")
        .eq("budget_id", budgetId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as BudgetItem[];
    },
    enabled: !!budgetId,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      totalBudget,
      currency = "SEK",
    }: {
      eventId: string;
      totalBudget: number;
      currency?: string;
    }) => {
      const { data, error } = await supabase
        .from("budgets")
        .insert({
          event_id: eventId,
          total_budget: totalBudget,
          currency,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget", variables.eventId] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Budget>;
    }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budget", data.event_id] });
    },
  });
};

export const useAddBudgetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      budgetId,
      category,
      description,
      estimatedCost,
      actualCost = 0,
    }: {
      budgetId: string;
      category: string;
      description: string;
      estimatedCost: number;
      actualCost?: number;
    }) => {
      const { data, error } = await supabase
        .from("budget_items")
        .insert({
          budget_id: budgetId,
          category,
          description,
          estimated_cost: estimatedCost,
          actual_cost: actualCost,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budget_items", data.budget_id] });
    },
  });
};

export const useUpdateBudgetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      budgetId,
      updates,
    }: {
      id: string;
      budgetId: string;
      updates: Partial<BudgetItem>;
    }) => {
      const { data, error } = await supabase
        .from("budget_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget_items", variables.budgetId] });
    },
  });
};

export const useDeleteBudgetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, budgetId }: { id: string; budgetId: string }) => {
      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget_items", variables.budgetId] });
    },
  });
};
