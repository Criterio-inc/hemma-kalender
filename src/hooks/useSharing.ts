import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SharedEvent {
  id: string;
  event_id: string;
  share_token: string;
  recipient_email: string | null;
  access_level: "view" | "edit";
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface SharedRecipe {
  id: string;
  recipe_id: string;
  share_token: string;
  created_by: string | null;
  created_at: string;
}

// Generate a random token
const generateToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Hook to get shared events for an event
export const useEventShares = (eventId: string) => {
  return useQuery({
    queryKey: ["shared_events", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_events")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SharedEvent[];
    },
    enabled: !!eventId,
  });
};

// Hook to create a share link for an event
export const useCreateEventShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      accessLevel,
      expiresAt,
      recipientEmail,
    }: {
      eventId: string;
      accessLevel: "view" | "edit";
      expiresAt: Date | null;
      recipientEmail?: string;
    }) => {
      const shareToken = generateToken();

      const { data, error } = await supabase
        .from("shared_events")
        .insert({
          event_id: eventId,
          share_token: shareToken,
          access_level: accessLevel,
          expires_at: expiresAt?.toISOString() || null,
          recipient_email: recipientEmail || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SharedEvent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shared_events", variables.eventId] });
    },
  });
};

// Hook to get all shared events for a household
export const useHouseholdShares = (householdCode: string) => {
  return useQuery({
    queryKey: ["household_shares", householdCode],
    queryFn: async () => {
      // Get all events for the household first
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id")
        .eq("household_code", householdCode);

      if (eventsError) throw eventsError;

      if (!events || events.length === 0) return [];

      const eventIds = events.map((e) => e.id);

      const { data, error } = await supabase
        .from("shared_events")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SharedEvent[];
    },
    enabled: !!householdCode,
  });
};

// Hook to delete a share link
export const useDeleteEventShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId?: string }) => {
      const { error } = await supabase
        .from("shared_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId, _) => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["shared_events", eventId] });
      }
      queryClient.invalidateQueries({ queryKey: ["household_shares"] });
    },
  });
};

// Hook to get shared event by token (for public view)
export const useSharedEventByToken = (token: string) => {
  return useQuery({
    queryKey: ["shared_event", token],
    queryFn: async () => {
      // First get the share record
      const { data: shareData, error: shareError } = await supabase
        .from("shared_events")
        .select("*")
        .eq("share_token", token)
        .single();

      if (shareError) throw shareError;

      const share = shareData as SharedEvent;

      // Check if expired
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        throw new Error("Delningslänken har gått ut");
      }

      // Get the event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", share.event_id)
        .single();

      if (eventError) throw eventError;

      return {
        share,
        event: eventData,
      };
    },
    enabled: !!token,
  });
};

// Hook to get shared event data (todos, notes, recipes, etc.)
export const useSharedEventData = (eventId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shared_event_data", eventId],
    queryFn: async () => {
      // Fetch all related data
      const [todosRes, notesRes, recipesRes, imagesRes, linksRes, timelineRes] = await Promise.all([
        supabase.from("todos").select("*").eq("event_id", eventId).order("sort_order"),
        supabase.from("notes").select("*").eq("event_id", eventId).order("created_at", { ascending: false }),
        supabase.from("event_recipes").select("*, recipes(*)").eq("event_id", eventId),
        supabase.from("images").select("*").eq("event_id", eventId).order("sort_order"),
        supabase.from("links").select("*").eq("event_id", eventId),
        supabase.from("event_timeline").select("*").eq("event_id", eventId).order("weeks_before", { ascending: false }),
      ]);

      return {
        todos: todosRes.data || [],
        notes: notesRes.data || [],
        recipes: recipesRes.data || [],
        images: imagesRes.data || [],
        links: linksRes.data || [],
        timeline: timelineRes.data || [],
      };
    },
    enabled: !!eventId && enabled,
  });
};

// Hook to create a share link for a recipe
export const useCreateRecipeShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const shareToken = generateToken();

      const { data, error } = await supabase
        .from("shared_recipes")
        .insert({
          recipe_id: recipeId,
          share_token: shareToken,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SharedRecipe;
    },
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ["shared_recipes", recipeId] });
    },
  });
};

// Hook to get shared recipe by token
export const useSharedRecipeByToken = (token: string) => {
  return useQuery({
    queryKey: ["shared_recipe", token],
    queryFn: async () => {
      const { data: shareData, error: shareError } = await supabase
        .from("shared_recipes")
        .select("*")
        .eq("share_token", token)
        .single();

      if (shareError) throw shareError;

      const share = shareData as SharedRecipe;

      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", share.recipe_id)
        .single();

      if (recipeError) throw recipeError;

      return {
        share,
        recipe: recipeData,
      };
    },
    enabled: !!token,
  });
};

// Hook to log activity
export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      householdCode,
      eventId,
      actionType,
      entityType,
      entityId,
      entityTitle,
      actorName,
    }: {
      householdCode: string;
      eventId?: string;
      actionType: string;
      entityType: string;
      entityId?: string;
      entityTitle?: string;
      actorName?: string;
    }) => {
      const { error } = await supabase.from("activity_log").insert({
        household_code: householdCode,
        event_id: eventId || null,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId || null,
        entity_title: entityTitle || null,
        actor_name: actorName || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_log"] });
    },
  });
};

// Hook to get activity log for an event
export const useActivityLog = (eventId: string) => {
  return useQuery({
    queryKey: ["activity_log", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};
