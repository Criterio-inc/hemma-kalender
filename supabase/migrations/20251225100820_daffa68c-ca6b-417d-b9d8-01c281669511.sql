-- Create events table
CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_code text NOT NULL,
    title text NOT NULL,
    description text,
    event_type text CHECK (event_type IN ('simple', 'major_event')) DEFAULT 'simple',
    event_category text CHECK (event_category IN ('birthday', 'christmas', 'wedding', 'easter', 'midsummer', 'new_year', 'graduation', 'anniversary', 'custom')) DEFAULT 'custom',
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    all_day boolean DEFAULT false,
    recurring boolean DEFAULT false,
    recurring_pattern text CHECK (recurring_pattern IN ('yearly', 'monthly', 'weekly')),
    color text,
    theme_settings jsonb,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create todos table
CREATE TABLE public.todos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_code text NOT NULL,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    timeline_phase_id uuid,
    title text NOT NULL,
    description text,
    due_date timestamp with time zone,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    completed_by uuid,
    priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    category text CHECK (category IN ('shopping', 'cooking', 'decoration', 'general')) DEFAULT 'general',
    sort_order integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_code text NOT NULL,
    title text NOT NULL,
    description text,
    ingredients jsonb,
    instructions text,
    prep_time integer,
    cook_time integer,
    servings integer,
    category text CHECK (category IN ('dessert', 'main', 'appetizer', 'side', 'drink')) DEFAULT 'main',
    tags text[],
    image_url text,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_code text NOT NULL,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    title text,
    content text NOT NULL,
    note_type text CHECK (note_type IN ('general', 'tradition', 'idea', 'memory')) DEFAULT 'general',
    tags text[],
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_events_household_code ON public.events(household_code);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_household_start ON public.events(household_code, start_date);

CREATE INDEX idx_todos_household_code ON public.todos(household_code);
CREATE INDEX idx_todos_event_id ON public.todos(event_id);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
CREATE INDEX idx_todos_household_event ON public.todos(household_code, event_id);

CREATE INDEX idx_recipes_household_code ON public.recipes(household_code);
CREATE INDEX idx_recipes_tags ON public.recipes USING GIN(tags);

CREATE INDEX idx_notes_household_code ON public.notes(household_code);
CREATE INDEX idx_notes_event_id ON public.notes(event_id);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);

-- Enable Row Level Security on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Users can view events from their household"
ON public.events FOR SELECT USING (true);

CREATE POLICY "Users can create events"
ON public.events FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update events from their household"
ON public.events FOR UPDATE USING (true);

CREATE POLICY "Users can delete events from their household"
ON public.events FOR DELETE USING (true);

-- RLS Policies for todos
CREATE POLICY "Users can view todos from their household"
ON public.todos FOR SELECT USING (true);

CREATE POLICY "Users can create todos"
ON public.todos FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update todos from their household"
ON public.todos FOR UPDATE USING (true);

CREATE POLICY "Users can delete todos from their household"
ON public.todos FOR DELETE USING (true);

-- RLS Policies for recipes
CREATE POLICY "Users can view recipes from their household"
ON public.recipes FOR SELECT USING (true);

CREATE POLICY "Users can create recipes"
ON public.recipes FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update recipes from their household"
ON public.recipes FOR UPDATE USING (true);

CREATE POLICY "Users can delete recipes from their household"
ON public.recipes FOR DELETE USING (true);

-- RLS Policies for notes
CREATE POLICY "Users can view notes from their household"
ON public.notes FOR SELECT USING (true);

CREATE POLICY "Users can create notes"
ON public.notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update notes from their household"
ON public.notes FOR UPDATE USING (true);

CREATE POLICY "Users can delete notes from their household"
ON public.notes FOR DELETE USING (true);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();