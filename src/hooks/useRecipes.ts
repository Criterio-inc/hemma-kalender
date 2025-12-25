import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type Recipe = {
  id: string;
  household_code: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[] | null;
  instructions: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  category: string | null;
  tags: string[] | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeInsert = {
  household_code: string;
  title: string;
  description?: string | null;
  ingredients?: Ingredient[] | null;
  instructions?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  category?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
};

export type RecipeUpdate = {
  title?: string;
  description?: string | null;
  ingredients?: Ingredient[] | null;
  instructions?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  category?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
};

export type EventRecipe = {
  id: string;
  event_id: string;
  recipe_id: string;
  meal_type: string | null;
  planned_date: string | null;
  created_at: string;
  recipe?: Recipe;
};

export type EventRecipeInsert = {
  event_id: string;
  recipe_id: string;
  meal_type?: string | null;
  planned_date?: string | null;
};

// Get all recipes for a household
export const useRecipes = (householdCode: string) => {
  return useQuery({
    queryKey: ["recipes", householdCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("household_code", householdCode)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse ingredients from JSON
      return (data || []).map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients as Ingredient[] | null,
      })) as Recipe[];
    },
    enabled: !!householdCode,
  });
};

// Get single recipe
export const useRecipe = (recipeId: string) => {
  return useQuery({
    queryKey: ["recipes", recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        ingredients: data.ingredients as Ingredient[] | null,
      } as Recipe;
    },
    enabled: !!recipeId,
  });
};

// Create recipe
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: RecipeInsert) => {
      const { data, error } = await supabase
        .from("recipes")
        .insert([{ ...recipe, ingredients: recipe.ingredients as any } as any])
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

// Update recipe
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RecipeUpdate }) => {
      const { data, error } = await supabase
        .from("recipes")
        .update({ ...updates, ingredients: updates.ingredients as any } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

// Delete recipe
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

// Get recipes for an event
export const useEventRecipes = (eventId: string) => {
  return useQuery({
    queryKey: ["event_recipes", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_recipes")
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq("event_id", eventId);

      if (error) throw error;
      
      return (data || []).map((er) => ({
        ...er,
        recipe: er.recipe ? {
          ...er.recipe,
          ingredients: er.recipe.ingredients as Ingredient[] | null,
        } : undefined,
      })) as EventRecipe[];
    },
    enabled: !!eventId,
  });
};

// Add recipe to event
export const useAddRecipeToEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventRecipe: EventRecipeInsert) => {
      const { data, error } = await supabase
        .from("event_recipes")
        .insert([eventRecipe as any])
        .select()
        .single();

      if (error) throw error;
      return data as EventRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_recipes"] });
    },
  });
};

// Remove recipe from event
export const useRemoveRecipeFromEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_recipes"] });
    },
  });
};

// Upload recipe image
export const uploadRecipeImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("recipe-images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};
