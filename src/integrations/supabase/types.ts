export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          actor_name: string | null
          created_at: string
          entity_id: string | null
          entity_title: string | null
          entity_type: string
          event_id: string | null
          household_code: string
          id: string
        }
        Insert: {
          action_type: string
          actor_name?: string | null
          created_at?: string
          entity_id?: string | null
          entity_title?: string | null
          entity_type: string
          event_id?: string | null
          household_code: string
          id?: string
        }
        Update: {
          action_type?: string
          actor_name?: string | null
          created_at?: string
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string
          event_id?: string | null
          household_code?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_interactions: {
        Row: {
          created_at: string
          household_code: string
          id: string
          interaction_type: string
          query: string | null
          response: Json | null
        }
        Insert: {
          created_at?: string
          household_code: string
          id?: string
          interaction_type?: string
          query?: string | null
          response?: Json | null
        }
        Update: {
          created_at?: string
          household_code?: string
          id?: string
          interaction_type?: string
          query?: string | null
          response?: Json | null
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          actual_cost: number | null
          budget_id: string
          category: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          paid: boolean | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          budget_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          paid?: boolean | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          budget_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          paid?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string
          currency: string | null
          event_id: string
          id: string
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          event_id: string
          id?: string
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          event_id?: string
          id?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_recipes: {
        Row: {
          created_at: string
          event_id: string
          id: string
          meal_type: string | null
          planned_date: string | null
          recipe_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          meal_type?: string | null
          planned_date?: string | null
          recipe_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          meal_type?: string | null
          planned_date?: string | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_recipes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      event_timeline: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          phase_name: string
          sort_order: number | null
          weeks_before: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          phase_name: string
          sort_order?: number | null
          weeks_before?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          phase_name?: string
          sort_order?: number | null
          weeks_before?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_timeline_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_category: string | null
          event_type: string | null
          has_budget: boolean | null
          has_guest_list: boolean | null
          has_timeline: boolean | null
          household_code: string
          id: string
          recurring: boolean | null
          recurring_pattern: string | null
          start_date: string
          theme_settings: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_category?: string | null
          event_type?: string | null
          has_budget?: boolean | null
          has_guest_list?: boolean | null
          has_timeline?: boolean | null
          household_code: string
          id?: string
          recurring?: boolean | null
          recurring_pattern?: string | null
          start_date: string
          theme_settings?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_category?: string | null
          event_type?: string | null
          has_budget?: boolean | null
          has_guest_list?: boolean | null
          has_timeline?: boolean | null
          household_code?: string
          id?: string
          recurring?: boolean | null
          recurring_pattern?: string | null
          start_date?: string
          theme_settings?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          dietary_requirements: string | null
          email: string | null
          event_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          plus_one: boolean | null
          rsvp_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dietary_requirements?: string | null
          email?: string | null
          event_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          rsvp_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dietary_requirements?: string | null
          email?: string | null
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          rsvp_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          household_code: string
          household_name: string | null
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          household_code: string
          household_name?: string | null
          id?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          household_code?: string
          household_name?: string | null
          id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string | null
          household_code: string
          id: string
          recipe_id: string | null
          sort_order: number | null
          tags: string[] | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          household_code: string
          id?: string
          recipe_id?: string | null
          sort_order?: number | null
          tags?: string[] | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          household_code?: string
          id?: string
          recipe_id?: string | null
          sort_order?: number | null
          tags?: string[] | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_id: string | null
          household_code: string
          id: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          household_code: string
          id?: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          household_code?: string
          id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          created_at: string
          custom_meal_name: string | null
          day_of_week: number
          id: string
          meal_plan_id: string
          meal_type: string
          notes: string | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          custom_meal_name?: string | null
          day_of_week: number
          id?: string
          meal_plan_id: string
          meal_type: string
          notes?: string | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          custom_meal_name?: string | null
          day_of_week?: number
          id?: string
          meal_plan_id?: string
          meal_type?: string
          notes?: string | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          created_by: string | null
          household_code: string
          id: string
          updated_at: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          household_code: string
          id?: string
          updated_at?: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          household_code?: string
          id?: string
          updated_at?: string
          week_start_date?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          event_id: string | null
          household_code: string
          id: string
          note_type: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          household_code: string
          id?: string
          note_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          household_code?: string
          id?: string
          note_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          event_id: string | null
          household_code: string
          id: string
          message: string
          notification_type: string
          read: boolean | null
          scheduled_for: string | null
          sent: boolean | null
          sent_at: string | null
          todo_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          household_code: string
          id?: string
          message: string
          notification_type?: string
          read?: boolean | null
          scheduled_for?: string | null
          sent?: boolean | null
          sent_at?: string | null
          todo_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          household_code?: string
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          scheduled_for?: string | null
          sent?: boolean | null
          sent_at?: string | null
          todo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          cook_time: number | null
          created_at: string
          created_by: string | null
          description: string | null
          household_code: string
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: string | null
          prep_time: number | null
          servings: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cook_time?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          household_code: string
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          prep_time?: number | null
          servings?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cook_time?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          household_code?: string
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          prep_time?: number | null
          servings?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_events: {
        Row: {
          access_level: string
          created_at: string
          created_by: string | null
          event_id: string
          expires_at: string | null
          id: string
          recipient_email: string | null
          share_token: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          recipient_email?: string | null
          share_token: string
        }
        Update: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          recipient_email?: string | null
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_recipes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          recipe_id: string
          share_token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          recipe_id: string
          share_token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          recipe_id?: string
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          category: string | null
          checked: boolean | null
          checked_at: string | null
          checked_by: string | null
          created_at: string
          id: string
          item_name: string
          quantity: string | null
          shopping_list_id: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          checked?: boolean | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          id?: string
          item_name: string
          quantity?: string | null
          shopping_list_id: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          checked?: boolean | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          id?: string
          item_name?: string
          quantity?: string | null
          shopping_list_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          created_by: string | null
          created_from: string | null
          event_id: string | null
          household_code: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_from?: string | null
          event_id?: string | null
          household_code: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_from?: string | null
          event_id?: string | null
          household_code?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          category: string | null
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          event_id: string | null
          household_code: string
          id: string
          priority: string | null
          sort_order: number | null
          timeline_phase_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          household_code: string
          id?: string
          priority?: string | null
          sort_order?: number | null
          timeline_phase_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          household_code?: string
          id?: string
          priority?: string | null
          sort_order?: number | null
          timeline_phase_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
