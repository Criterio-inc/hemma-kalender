-- Create images table
CREATE TABLE public.images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    household_code TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    tags TEXT[],
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create links table
CREATE TABLE public.links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    household_code TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on images
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- RLS policies for images
CREATE POLICY "Users can view images" ON public.images
FOR SELECT USING (true);

CREATE POLICY "Users can create images" ON public.images
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update images" ON public.images
FOR UPDATE USING (true);

CREATE POLICY "Users can delete images" ON public.images
FOR DELETE USING (true);

-- Enable RLS on links
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- RLS policies for links
CREATE POLICY "Users can view links" ON public.links
FOR SELECT USING (true);

CREATE POLICY "Users can create links" ON public.links
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update links" ON public.links
FOR UPDATE USING (true);

CREATE POLICY "Users can delete links" ON public.links
FOR DELETE USING (true);

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true);

-- Storage policies for event images
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Users can update their event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images');

CREATE POLICY "Users can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-images');