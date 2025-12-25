// Database Types for Familjekalendern

// Enums
export type EventType = 'simple' | 'major_event';

export type EventCategory = 
  | 'birthday' 
  | 'christmas' 
  | 'wedding' 
  | 'easter' 
  | 'midsummer' 
  | 'new_year' 
  | 'graduation' 
  | 'anniversary' 
  | 'custom';

export type RecurringPattern = 'yearly' | 'monthly' | 'weekly';

export type Priority = 'low' | 'medium' | 'high';

export type TodoCategory = 'shopping' | 'cooking' | 'decoration' | 'general';

export type RecipeCategory = 'dessert' | 'main' | 'appetizer' | 'side' | 'drink';

export type NoteType = 'general' | 'tradition' | 'idea' | 'memory';

// Theme settings for major events
export interface ThemeSettings {
  backgroundColor?: string;
  headerImage?: string;
  accentColor?: string;
  fontFamily?: string;
  customStyles?: Record<string, string>;
}

// Ingredient structure for recipes
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

// Household
export interface Household {
  id: string;
  household_code: string;
  password_hash: string;
  household_name: string | null;
  created_at: string;
  updated_at: string;
}

export type HouseholdInsert = Omit<Household, 'id' | 'created_at' | 'updated_at'>;
export type HouseholdUpdate = Partial<HouseholdInsert>;

// Event
export interface Event {
  id: string;
  household_code: string;
  title: string;
  description: string | null;
  event_type: EventType;
  event_category: EventCategory;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  recurring: boolean;
  recurring_pattern: RecurringPattern | null;
  color: string | null;
  theme_settings: ThemeSettings | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type EventUpdate = Partial<EventInsert>;

// Todo
export interface Todo {
  id: string;
  household_code: string;
  event_id: string | null;
  timeline_phase_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  priority: Priority;
  category: TodoCategory;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TodoInsert = Omit<Todo, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TodoUpdate = Partial<TodoInsert>;

// Recipe
export interface Recipe {
  id: string;
  household_code: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[] | null;
  instructions: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  category: RecipeCategory;
  tags: string[] | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type RecipeInsert = Omit<Recipe, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type RecipeUpdate = Partial<RecipeInsert>;

// Note
export interface Note {
  id: string;
  household_code: string;
  event_id: string | null;
  title: string | null;
  content: string;
  note_type: NoteType;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NoteUpdate = Partial<NoteInsert>;

// Swedish Holidays
export interface SwedishHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  type: 'public' | 'observance' | 'flag_day';
  isRedDay: boolean; // "Röd dag" - official day off
}

// Calendar display types
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: Event[];
  holiday?: SwedishHoliday;
}

// Session types
export interface HouseholdSession {
  householdId: string;
  householdCode: string;
  householdName: string;
}
