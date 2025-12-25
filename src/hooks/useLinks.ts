import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Link = {
  id: string;
  household_code: string;
  event_id: string | null;
  title: string;
  url: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export type LinkInsert = {
  household_code: string;
  event_id?: string | null;
  title: string;
  url: string;
  description?: string | null;
};

export type LinkUpdate = {
  title?: string;
  url?: string;
  description?: string | null;
};

export const useEventLinks = (eventId: string) => {
  return useQuery({
    queryKey: ["links", "event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Link[];
    },
    enabled: !!eventId,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: LinkInsert) => {
      const { data, error } = await supabase
        .from("links")
        .insert([link as any])
        .select()
        .single();

      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LinkUpdate }) => {
      const { data, error } = await supabase
        .from("links")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
};
