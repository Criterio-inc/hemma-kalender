import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShoppingList {
  id: string;
  household_code: string;
  event_id: string | null;
  title: string;
  created_from: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  item_name: string;
  quantity: string | null;
  category: string | null;
  checked: boolean | null;
  checked_by: string | null;
  checked_at: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface ShoppingListInsert {
  household_code: string;
  event_id?: string | null;
  title: string;
  created_from?: string;
}

export interface ShoppingListItemInsert {
  shopping_list_id: string;
  item_name: string;
  quantity?: string;
  category?: string;
  sort_order?: number;
}

// Fetch all shopping lists for a household
export function useShoppingLists(householdCode: string) {
  return useQuery({
    queryKey: ["shopping_lists", householdCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("household_code", householdCode)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ShoppingList[];
    },
    enabled: !!householdCode,
  });
}

// Fetch shopping lists for an event
export function useEventShoppingLists(eventId: string) {
  return useQuery({
    queryKey: ["shopping_lists", "event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ShoppingList[];
    },
    enabled: !!eventId,
  });
}

// Fetch a single shopping list with items
export function useShoppingList(listId: string) {
  return useQuery({
    queryKey: ["shopping_list", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("id", listId)
        .maybeSingle();

      if (error) throw error;
      return data as ShoppingList | null;
    },
    enabled: !!listId,
  });
}

// Fetch items for a shopping list
export function useShoppingListItems(listId: string) {
  return useQuery({
    queryKey: ["shopping_list_items", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("shopping_list_id", listId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ShoppingListItem[];
    },
    enabled: !!listId,
  });
}

// Create a new shopping list
export function useCreateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (list: ShoppingListInsert) => {
      const { data, error } = await supabase
        .from("shopping_lists")
        .insert(list)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shopping_lists"] });
      if (data.event_id) {
        queryClient.invalidateQueries({
          queryKey: ["shopping_lists", "event", data.event_id],
        });
      }
    },
  });
}

// Update a shopping list
export function useUpdateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ShoppingList>;
    }) => {
      const { data, error } = await supabase
        .from("shopping_lists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shopping_lists"] });
      queryClient.invalidateQueries({ queryKey: ["shopping_list", data.id] });
    },
  });
}

// Delete a shopping list
export function useDeleteShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping_lists"] });
    },
  });
}

// Add item to shopping list
export function useAddShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ShoppingListItemInsert) => {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingListItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping_list_items", data.shopping_list_id],
      });
    },
  });
}

// Update shopping list item
export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ShoppingListItem>;
    }) => {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ShoppingListItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping_list_items", data.shopping_list_id],
      });
    },
  });
}

// Toggle item checked
export function useToggleShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      checked,
      listId,
    }: {
      id: string;
      checked: boolean;
      listId: string;
    }) => {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          checked,
          checked_at: checked ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
      return { id, listId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping_list_items", data.listId],
      });
    },
  });
}

// Delete shopping list item
export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, listId }: { id: string; listId: string }) => {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return listId;
    },
    onSuccess: (listId) => {
      queryClient.invalidateQueries({
        queryKey: ["shopping_list_items", listId],
      });
    },
  });
}
