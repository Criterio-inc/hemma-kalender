import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/hooks/useEvents";
import { toast } from "sonner";

// Types for import data
interface ImportData {
  recipes: boolean;
  notes: boolean;
  links: boolean;
  todos: boolean;
  budgetItems: boolean;
  timelinePhases: boolean;
  guests: boolean;
  images: boolean;
}

interface PreviousEventData {
  event: Event;
  recipes: any[];
  notes: any[];
  links: any[];
  todos: any[];
  budget: any;
  budgetItems: any[];
  timelinePhases: any[];
  guests: any[];
  images: any[];
}

// Hook to find previous years' events with the same category
export const usePreviousYearEvents = (householdCode: string, category: string) => {
  return useQuery({
    queryKey: ["previousYearEvents", householdCode, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("household_code", householdCode)
        .eq("event_category", category)
        .order("start_date", { ascending: false });

      if (error) throw error;
      
      // Group by year
      const eventsByYear: Record<number, any> = {};
      data.forEach((event: any) => {
        const year = new Date(event.start_date).getFullYear();
        if (!eventsByYear[year]) {
          eventsByYear[year] = event;
        }
      });

      return Object.entries(eventsByYear)
        .map(([year, event]) => ({ year: parseInt(year), event }))
        .sort((a, b) => b.year - a.year);
    },
    enabled: !!householdCode && !!category && category !== "custom",
  });
};

// Hook to fetch all data from a previous event
export const usePreviousEventData = (eventId: string | null) => {
  return useQuery({
    queryKey: ["previousEventData", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      // Fetch event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (eventError) throw eventError;

      // Fetch event recipes
      const { data: eventRecipes = [] } = await supabase
        .from("event_recipes")
        .select("*, recipes(*)")
        .eq("event_id", eventId);

      // Fetch notes
      const { data: notes = [] } = await supabase
        .from("notes")
        .select("*")
        .eq("event_id", eventId);

      // Fetch links
      const { data: links = [] } = await supabase
        .from("links")
        .select("*")
        .eq("event_id", eventId);

      // Fetch todos
      const { data: todos = [] } = await supabase
        .from("todos")
        .select("*")
        .eq("event_id", eventId);

      // Fetch budget
      const { data: budget } = await supabase
        .from("budgets")
        .select("*")
        .eq("event_id", eventId)
        .single();

      let budgetItems: any[] = [];
      if (budget) {
        const { data } = await supabase
          .from("budget_items")
          .select("*")
          .eq("budget_id", budget.id);
        budgetItems = data || [];
      }

      // Fetch timeline phases
      const { data: timelinePhases = [] } = await supabase
        .from("event_timeline")
        .select("*")
        .eq("event_id", eventId);

      // Fetch guests
      const { data: guests = [] } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId);

      // Fetch images
      const { data: images = [] } = await supabase
        .from("images")
        .select("*")
        .eq("event_id", eventId);

      return {
        event: event as Event,
        recipes: eventRecipes,
        notes,
        links,
        todos,
        budgetItems,
        budget,
        timelinePhases,
        guests,
        images,
      };
    },
    enabled: !!eventId,
  });
};

// Hook to get AI suggestions for import
export const useImportSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const getSuggestions = async (data: PreviousEventData) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("ai-import-suggestions", {
        body: {
          previousEvent: data.event,
          recipes: data.recipes,
          notes: data.notes,
          links: data.links,
          todos: data.todos,
          budgetItems: data.budgetItems,
          guests: data.guests,
          images: data.images,
          timelinePhases: data.timelinePhases,
        },
      });

      if (response.error) {
        throw response.error;
      }

      setSuggestion(response.data?.suggestion || null);
      return response.data;
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast.error("Kunde inte hämta AI-förslag");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getSuggestions, suggestion, isLoading, setSuggestion };
};

// Hook to perform the actual import
export const useImportData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetEventId,
      sourceEventId,
      householdCode,
      importOptions,
      previousData,
      targetEventDate,
    }: {
      targetEventId: string;
      sourceEventId: string;
      householdCode: string;
      importOptions: ImportData;
      previousData: PreviousEventData;
      targetEventDate: Date;
    }) => {
      const results = {
        recipes: 0,
        notes: 0,
        links: 0,
        todos: 0,
        budgetItems: 0,
        timelinePhases: 0,
        guests: 0,
        images: 0,
      };

      const sourceDate = new Date(previousData.event.start_date);
      const daysDiff = Math.floor((targetEventDate.getTime() - sourceDate.getTime()) / (1000 * 60 * 60 * 24));

      // Import recipes (link existing recipes to new event)
      if (importOptions.recipes && previousData.recipes.length > 0) {
        for (const recipeLink of previousData.recipes) {
          const { error } = await supabase.from("event_recipes").insert({
            event_id: targetEventId,
            recipe_id: recipeLink.recipe_id,
            meal_type: recipeLink.meal_type,
            planned_date: recipeLink.planned_date 
              ? new Date(new Date(recipeLink.planned_date).getTime() + daysDiff * 24 * 60 * 60 * 1000).toISOString()
              : null,
          });
          if (!error) results.recipes++;
        }
      }

      // Import notes (copy with new IDs)
      if (importOptions.notes && previousData.notes.length > 0) {
        for (const note of previousData.notes) {
          const { error } = await supabase.from("notes").insert({
            household_code: householdCode,
            event_id: targetEventId,
            title: note.title,
            content: note.content,
            note_type: note.note_type,
            tags: note.tags,
          });
          if (!error) results.notes++;
        }
      }

      // Import links (copy with new IDs)
      if (importOptions.links && previousData.links.length > 0) {
        for (const link of previousData.links) {
          const { error } = await supabase.from("links").insert({
            household_code: householdCode,
            event_id: targetEventId,
            title: link.title,
            url: link.url,
            description: link.description,
          });
          if (!error) results.links++;
        }
      }

      // Import todos (copy with adjusted dates, uncompleted)
      if (importOptions.todos && previousData.todos.length > 0) {
        for (const todo of previousData.todos) {
          let newDueDate = null;
          if (todo.due_date) {
            newDueDate = new Date(new Date(todo.due_date).getTime() + daysDiff * 24 * 60 * 60 * 1000).toISOString();
          }
          
          const { error } = await supabase.from("todos").insert({
            household_code: householdCode,
            event_id: targetEventId,
            timeline_phase_id: null, // Will need to be re-linked if timeline is also imported
            title: todo.title,
            description: todo.description,
            due_date: newDueDate,
            completed: false,
            completed_at: null,
            completed_by: null,
            priority: todo.priority,
            category: todo.category,
            sort_order: todo.sort_order,
          });
          if (!error) results.todos++;
        }
      }

      // Import budget items (copy structure, clear actual costs)
      if (importOptions.budgetItems && previousData.budgetItems.length > 0) {
        // First create a budget for the target event
        const { data: newBudget, error: budgetError } = await supabase
          .from("budgets")
          .insert({
            event_id: targetEventId,
            total_budget: previousData.budget?.total_budget || 0,
            currency: previousData.budget?.currency || "SEK",
          })
          .select()
          .single();

        if (!budgetError && newBudget) {
          for (const item of previousData.budgetItems) {
            const { error } = await supabase.from("budget_items").insert({
              budget_id: newBudget.id,
              description: item.description,
              category: item.category,
              estimated_cost: item.estimated_cost,
              actual_cost: 0, // Reset actual costs
              paid: false,
            });
            if (!error) results.budgetItems++;
          }
        }
      }

      // Import timeline phases
      if (importOptions.timelinePhases && previousData.timelinePhases.length > 0) {
        for (const phase of previousData.timelinePhases) {
          const { error } = await supabase.from("event_timeline").insert({
            event_id: targetEventId,
            phase_name: phase.phase_name,
            weeks_before: phase.weeks_before,
            description: phase.description,
            sort_order: phase.sort_order,
          });
          if (!error) results.timelinePhases++;
        }
      }

      // Import guests (copy, reset RSVP to pending)
      if (importOptions.guests && previousData.guests.length > 0) {
        for (const guest of previousData.guests) {
          const { error } = await supabase.from("guests").insert({
            event_id: targetEventId,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            rsvp_status: "pending", // Reset RSVP
            dietary_requirements: guest.dietary_requirements,
            notes: guest.notes,
            plus_one: guest.plus_one,
          });
          if (!error) results.guests++;
        }
      }

      // Import images (reference same images, don't copy files)
      if (importOptions.images && previousData.images.length > 0) {
        for (const image of previousData.images) {
          const { error } = await supabase.from("images").insert({
            household_code: householdCode,
            event_id: targetEventId,
            url: image.url,
            caption: image.caption,
            tags: image.tags,
            sort_order: image.sort_order,
          });
          if (!error) results.images++;
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event_recipes"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      queryClient.invalidateQueries({ queryKey: ["budget_items"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};
