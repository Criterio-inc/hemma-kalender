import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, format } from "date-fns";

// Use the generated types from Supabase
type Event = {
  id: string;
  household_code: string;
  title: string;
  description: string | null;
  event_type: string | null;
  event_category: string | null;
  start_date: string;
  end_date: string | null;
  all_day: boolean | null;
  recurring: boolean | null;
  recurring_pattern: string | null;
  color: string | null;
  theme_settings: Record<string, unknown> | null;
  has_timeline: boolean | null;
  has_budget: boolean | null;
  has_guest_list: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type EventInsert = {
  household_code: string;
  title: string;
  start_date: string;
  description?: string | null;
  event_type?: string | null;
  event_category?: string | null;
  end_date?: string | null;
  all_day?: boolean | null;
  recurring?: boolean | null;
  recurring_pattern?: string | null;
  color?: string | null;
  theme_settings?: unknown;
  has_timeline?: boolean | null;
  has_budget?: boolean | null;
  has_guest_list?: boolean | null;
  created_by?: string | null;
};

type EventUpdate = {
  title?: string;
  description?: string | null;
  event_type?: string | null;
  event_category?: string | null;
  start_date?: string;
  end_date?: string | null;
  all_day?: boolean | null;
  recurring?: boolean | null;
  recurring_pattern?: string | null;
  color?: string | null;
  theme_settings?: unknown;
};

export type { Event, EventInsert, EventUpdate };

export const useEvents = (householdCode: string, currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  return useQuery({
    queryKey: ["events", householdCode, format(monthStart, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("household_code", householdCode)
        .gte("start_date", monthStart.toISOString())
        .lte("start_date", monthEnd.toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!householdCode,
  });
};

export const useEventsForDate = (householdCode: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return useQuery({
    queryKey: ["events", householdCode, format(date, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("household_code", householdCode)
        .gte("start_date", startOfDay.toISOString())
        .lte("start_date", endOfDay.toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!householdCode,
  });
};

export const useEventsForWeek = (householdCode: string, date: Date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

  return useQuery({
    queryKey: ["events", householdCode, "week", format(weekStart, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("household_code", householdCode)
        .gte("start_date", weekStart.toISOString())
        .lte("start_date", weekEnd.toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!householdCode,
  });
};

export const useEventsForYear = (householdCode: string, year: number) => {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));

  return useQuery({
    queryKey: ["events", householdCode, "year", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("household_code", householdCode)
        .gte("start_date", yearStart.toISOString())
        .lte("start_date", yearEnd.toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!householdCode,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: EventInsert) => {
      const { data, error } = await supabase
        .from("events")
        .insert([event as any])
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EventUpdate }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
