-- Create event_timeline table for major event phases
CREATE TABLE public.event_timeline (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    phase_name text NOT NULL,
    weeks_before integer NOT NULL DEFAULT 0,
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_event_timeline_event_id ON public.event_timeline(event_id);
CREATE INDEX idx_event_timeline_sort_order ON public.event_timeline(event_id, sort_order);

-- Enable RLS
ALTER TABLE public.event_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_timeline
CREATE POLICY "Users can view timeline phases"
ON public.event_timeline FOR SELECT USING (true);

CREATE POLICY "Users can create timeline phases"
ON public.event_timeline FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update timeline phases"
ON public.event_timeline FOR UPDATE USING (true);

CREATE POLICY "Users can delete timeline phases"
ON public.event_timeline FOR DELETE USING (true);

-- Add columns to events table for major event features
ALTER TABLE public.events 
ADD COLUMN has_timeline boolean DEFAULT false,
ADD COLUMN has_budget boolean DEFAULT false,
ADD COLUMN has_guest_list boolean DEFAULT false;