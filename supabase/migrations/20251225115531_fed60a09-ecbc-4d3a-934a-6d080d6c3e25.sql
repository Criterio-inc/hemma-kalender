-- Create shared_events table for event sharing
CREATE TABLE public.shared_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  recipient_email TEXT,
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'edit')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared_recipes table for recipe sharing
CREATE TABLE public.shared_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_log table for tracking collaboration
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_code TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_title TEXT,
  actor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for shared_events
CREATE POLICY "Anyone can view shared events by token"
ON public.shared_events
FOR SELECT
USING (true);

CREATE POLICY "Users can create shared events"
ON public.shared_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete shared events"
ON public.shared_events
FOR DELETE
USING (true);

-- RLS policies for shared_recipes
CREATE POLICY "Anyone can view shared recipes by token"
ON public.shared_recipes
FOR SELECT
USING (true);

CREATE POLICY "Users can create shared recipes"
ON public.shared_recipes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete shared recipes"
ON public.shared_recipes
FOR DELETE
USING (true);

-- RLS policies for activity_log
CREATE POLICY "Users can view activity logs"
ON public.activity_log
FOR SELECT
USING (true);

CREATE POLICY "Users can create activity logs"
ON public.activity_log
FOR INSERT
WITH CHECK (true);

-- Enable realtime for todos and notes for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- Create index for faster lookups
CREATE INDEX idx_shared_events_token ON public.shared_events(share_token);
CREATE INDEX idx_shared_events_event ON public.shared_events(event_id);
CREATE INDEX idx_shared_recipes_token ON public.shared_recipes(share_token);
CREATE INDEX idx_activity_log_event ON public.activity_log(event_id);
CREATE INDEX idx_activity_log_household ON public.activity_log(household_code);