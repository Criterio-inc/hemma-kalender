import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: string;
  plus_one: boolean;
  dietary_requirements: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventGuests = (eventId: string) => {
  return useQuery({
    queryKey: ["guests", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Guest[];
    },
    enabled: !!eventId,
  });
};

export const useAddGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      name,
      email,
      phone,
      rsvpStatus = "pending",
      plusOne = false,
      dietaryRequirements,
      notes,
    }: {
      eventId: string;
      name: string;
      email?: string;
      phone?: string;
      rsvpStatus?: string;
      plusOne?: boolean;
      dietaryRequirements?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("guests")
        .insert({
          event_id: eventId,
          name,
          email: email || null,
          phone: phone || null,
          rsvp_status: rsvpStatus,
          plus_one: plusOne,
          dietary_requirements: dietaryRequirements || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guests", data.event_id] });
    },
  });
};

export const useUpdateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      eventId,
      updates,
    }: {
      id: string;
      eventId: string;
      updates: Partial<Guest>;
    }) => {
      const { data, error } = await supabase
        .from("guests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guests", variables.eventId] });
    },
  });
};

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from("guests").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guests", variables.eventId] });
    },
  });
};
