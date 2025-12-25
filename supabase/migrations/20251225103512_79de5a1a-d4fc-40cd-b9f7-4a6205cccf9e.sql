-- Create event_recipes junction table
CREATE TABLE public.event_recipes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    meal_type TEXT DEFAULT 'dinner',
    planned_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, recipe_id)
);

-- Enable RLS on event_recipes
ALTER TABLE public.event_recipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_recipes
CREATE POLICY "Users can view event recipes" ON public.event_recipes
FOR SELECT USING (true);

CREATE POLICY "Users can create event recipes" ON public.event_recipes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update event recipes" ON public.event_recipes
FOR UPDATE USING (true);

CREATE POLICY "Users can delete event recipes" ON public.event_recipes
FOR DELETE USING (true);

-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe-images', 'recipe-images', true);

-- Storage policies for recipe images
CREATE POLICY "Anyone can view recipe images"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated users can upload recipe images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Users can update their recipe images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can delete recipe images"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipe-images');