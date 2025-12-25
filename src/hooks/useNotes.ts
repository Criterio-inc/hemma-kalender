import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Note = {
  id: string;
  household_code: string;
  event_id: string | null;
  title: string | null;
  content: string;
  note_type: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteInsert = {
  household_code: string;
  event_id?: string | null;
  title?: string | null;
  content: string;
  note_type?: string | null;
  tags?: string[] | null;
};

export type NoteUpdate = {
  title?: string | null;
  content?: string;
  note_type?: string | null;
  tags?: string[] | null;
};

export const useNotes = (householdCode: string, eventId?: string) => {
  return useQuery({
    queryKey: ["notes", householdCode, eventId],
    queryFn: async () => {
      let query = supabase
        .from("notes")
        .select("*")
        .eq("household_code", householdCode)
        .order("created_at", { ascending: false });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!householdCode,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: NoteInsert) => {
      const { data, error } = await supabase
        .from("notes")
        .insert([note as any])
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: NoteUpdate }) => {
      const { data, error } = await supabase
        .from("notes")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
