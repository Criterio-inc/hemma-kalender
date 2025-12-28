import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecipeRecommendation {
  title: string;
  description: string;
  reason: string;
  isExisting: boolean;
  existingRecipeId?: string;
  estimatedTime: number;
  difficulty: 'enkel' | 'mellan' | 'avancerad';
  season: string;
  tags: string[];
  recipe?: any;
}

interface RecipeRecommendationsResponse {
  recommendations: RecipeRecommendation[];
  summary: string;
}

interface MealPlanDay {
  dayOfWeek: number;
  dayName: string;
  dinner: {
    title: string;
    description: string;
    isExisting: boolean;
    existingRecipeId?: string;
    estimatedTime: number;
    category: string;
  } | null;
  lunch: {
    title: string;
    description: string;
  } | null;
}

interface MealPlanResponse {
  mealPlan: MealPlanDay[];
  shoppingList: { name: string; quantity: string; category: string }[];
  tips: string;
  summary: string;
}

interface TodoSuggestion {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  daysBeforeEvent: number;
  phaseId: string | null;
  reason: string;
}

interface TodoSuggestionsResponse {
  suggestions: TodoSuggestion[];
  insights: {
    completionRate: string;
    tips: string[];
    warnings: string[];
  };
  summary: string;
}

interface ParsedEvent {
  title: string;
  date: string | null;
  time: string | null;
  endTime: string | null;
  location: string | null;
  category: string;
  description: string | null;
  allDay: boolean;
  recurring: boolean;
  recurringPattern: string | null;
}

interface NaturalLanguageParseResponse {
  parsed: ParsedEvent;
  confidence: number;
  clarificationNeeded: boolean;
  clarificationQuestion: string | null;
}

export const useAIFeatures = (householdCode: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const getRecipeRecommendations = async (
    type: 'seasonal' | 'ingredients' | 'event' | 'dietary' | 'general',
    context: Record<string, any> = {}
  ): Promise<RecipeRecommendationsResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recipe-recommendations', {
        body: { householdCode, type, context },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('För många förfrågningar. Vänta en stund.');
        } else if (error.message?.includes('402')) {
          toast.error('AI-krediter slut.');
        } else {
          toast.error('Kunde inte hämta förslag');
        }
        return null;
      }

      return data as RecipeRecommendationsResponse;
    } catch (error) {
      console.error('Recipe recommendations error:', error);
      toast.error('Ett fel uppstod');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async (preferences: {
    cuisinePreference?: string;
    difficultyLevel?: string;
    quickWeekdays?: boolean;
    budgetLevel?: string;
    dietaryRestrictions?: string[];
    servings?: number;
  } = {}): Promise<MealPlanResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-meal-plan-generator', {
        body: { householdCode, preferences },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('För många förfrågningar. Vänta en stund.');
        } else if (error.message?.includes('402')) {
          toast.error('AI-krediter slut.');
        } else {
          toast.error('Kunde inte generera matsedel');
        }
        return null;
      }

      return data as MealPlanResponse;
    } catch (error) {
      console.error('Meal plan generator error:', error);
      toast.error('Ett fel uppstod');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTodoSuggestions = async (
    eventCategory: string,
    eventTitle: string,
    eventDate?: string,
    hasTimeline?: boolean,
    timelinePhases?: any[]
  ): Promise<TodoSuggestionsResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-todo-suggestions', {
        body: { 
          householdCode, 
          eventCategory, 
          eventTitle, 
          eventDate,
          hasTimeline,
          timelinePhases,
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('För många förfrågningar. Vänta en stund.');
        } else if (error.message?.includes('402')) {
          toast.error('AI-krediter slut.');
        } else {
          toast.error('Kunde inte hämta förslag');
        }
        return null;
      }

      return data as TodoSuggestionsResponse;
    } catch (error) {
      console.error('Todo suggestions error:', error);
      toast.error('Ett fel uppstod');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const parseNaturalLanguage = async (
    text: string,
    type: 'event' | 'todo' | 'recipe_search' = 'event'
  ): Promise<NaturalLanguageParseResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-natural-language-parse', {
        body: { text, type },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('För många förfrågningar. Vänta en stund.');
        } else if (error.message?.includes('402')) {
          toast.error('AI-krediter slut.');
        } else {
          toast.error('Kunde inte tolka texten');
        }
        return null;
      }

      return data as NaturalLanguageParseResponse;
    } catch (error) {
      console.error('Natural language parse error:', error);
      toast.error('Ett fel uppstod');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getRecipeRecommendations,
    generateMealPlan,
    getTodoSuggestions,
    parseNaturalLanguage,
  };
};
