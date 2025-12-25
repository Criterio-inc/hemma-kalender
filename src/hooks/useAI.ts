import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIRecipeSearchResult {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  relevance?: number;
  reason?: string;
}

interface AICategorizationResult {
  suggestedTags?: string[];
  suggestedCategory?: string;
  suggestedType?: string;
  reasoning?: string;
}

interface AIShoppingListItem {
  name: string;
  quantity: string;
  category: string;
}

interface AIShoppingListResult {
  items: AIShoppingListItem[];
  summary: string;
}

interface AINotesSearchResult {
  id: string;
  title: string | null;
  content: string;
  note_type: string | null;
  event_id: string | null;
  eventTitle?: string;
  excerpt?: string;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (
    query: string,
    householdCode: string
  ): Promise<{ results: AIRecipeSearchResult[]; suggestion?: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-recipe-search', {
        body: { query, householdCode }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return null;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ett fel uppstod vid sökning';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const categorize = useCallback(async (
    type: 'recipe' | 'note',
    data: Record<string, any>
  ): Promise<AICategorizationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('ai-categorize', {
        body: { type, data }
      });

      if (fnError) {
        throw fnError;
      }

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return null;
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ett fel uppstod vid kategorisering';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateShoppingList = useCallback(async (
    recipes: Array<{ title: string; servings?: number; ingredients: any }>,
    servingsMultiplier: number = 1
  ): Promise<AIShoppingListResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-shopping-list', {
        body: { recipes, servingsMultiplier }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return null;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ett fel uppstod vid generering av inköpslista';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchNotes = useCallback(async (
    query: string,
    householdCode: string,
    eventId?: string
  ): Promise<{ results: AINotesSearchResult[]; answer?: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-notes-search', {
        body: { query, householdCode, eventId }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return null;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ett fel uppstod vid sökning i anteckningar';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    searchRecipes,
    categorize,
    generateShoppingList,
    searchNotes,
  };
}
