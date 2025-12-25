import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TimelinePhase = {
  id: string;
  event_id: string;
  phase_name: string;
  weeks_before: number;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type TimelinePhaseInsert = {
  event_id: string;
  phase_name: string;
  weeks_before: number;
  description?: string | null;
  sort_order?: number;
};

export const useTimelinePhases = (eventId: string) => {
  return useQuery({
    queryKey: ["timeline", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_timeline")
        .select("*")
        .eq("event_id", eventId)
        .order("weeks_before", { ascending: false });

      if (error) throw error;
      return data as TimelinePhase[];
    },
    enabled: !!eventId,
  });
};

export const useCreateTimelinePhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phase: TimelinePhaseInsert) => {
      const { data, error } = await supabase
        .from("event_timeline")
        .insert([phase as any])
        .select()
        .single();

      if (error) throw error;
      return data as TimelinePhase;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["timeline", data.event_id] });
    },
  });
};

export const useCreateTimelinePhases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phases: TimelinePhaseInsert[]) => {
      const { data, error } = await supabase
        .from("event_timeline")
        .insert(phases as any[])
        .select();

      if (error) throw error;
      return data as TimelinePhase[];
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["timeline", data[0].event_id] });
      }
    },
  });
};

export const useUpdateTimelinePhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TimelinePhaseInsert>;
    }) => {
      const { data, error } = await supabase
        .from("event_timeline")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as TimelinePhase;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["timeline", data.event_id] });
    },
  });
};

export const useDeleteTimelinePhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase
        .from("event_timeline")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ["timeline", eventId] });
    },
  });
};
