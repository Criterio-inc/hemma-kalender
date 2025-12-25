import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EventImage = {
  id: string;
  household_code: string;
  event_id: string | null;
  recipe_id: string | null;
  url: string;
  caption: string | null;
  tags: string[] | null;
  sort_order: number | null;
  uploaded_by: string | null;
  created_at: string;
};

export type ImageInsert = {
  household_code: string;
  event_id?: string | null;
  recipe_id?: string | null;
  url: string;
  caption?: string | null;
  tags?: string[] | null;
  sort_order?: number | null;
};

export type ImageUpdate = {
  caption?: string | null;
  tags?: string[] | null;
  sort_order?: number | null;
};

export const useEventImages = (eventId: string) => {
  return useQuery({
    queryKey: ["images", "event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EventImage[];
    },
    enabled: !!eventId,
  });
};

export const useCreateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: ImageInsert) => {
      const { data, error } = await supabase
        .from("images")
        .insert([image as any])
        .select()
        .single();

      if (error) throw error;
      return data as EventImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ImageUpdate }) => {
      const { data, error } = await supabase
        .from("images")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as EventImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

// Upload image to storage
export const uploadEventImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("event-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("event-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
