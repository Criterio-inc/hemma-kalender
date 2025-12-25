import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Todo = {
  id: string;
  household_code: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string | null;
  category: string | null;
  event_id: string | null;
  timeline_phase_id: string | null;
  completed: boolean | null;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TodoInsert = {
  household_code: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string | null;
  category?: string | null;
  event_id?: string | null;
  timeline_phase_id?: string | null;
  sort_order?: number | null;
};

export type TodoUpdate = {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string | null;
  category?: string | null;
  event_id?: string | null;
  timeline_phase_id?: string | null;
  completed?: boolean | null;
  completed_at?: string | null;
  completed_by?: string | null;
  sort_order?: number | null;
};

export const useTodos = (householdCode: string) => {
  return useQuery({
    queryKey: ["todos", householdCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("household_code", householdCode)
        .order("sort_order", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!householdCode,
  });
};

export const useTodosForEvent = (eventId: string) => {
  return useQuery({
    queryKey: ["todos", "event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!eventId,
  });
};

export const useTodosForToday = (householdCode: string) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const todayEnd = today.toISOString();
  
  return useQuery({
    queryKey: ["todos", householdCode, "today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("household_code", householdCode)
        .or(`completed.is.null,completed.eq.false`)
        .lte("due_date", todayEnd)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!householdCode,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo: TodoInsert) => {
      const { data, error } = await supabase
        .from("todos")
        .insert([todo as any])
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TodoUpdate }) => {
      const { data, error } = await supabase
        .from("todos")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const updates: TodoUpdate = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("todos")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
