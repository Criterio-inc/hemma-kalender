-- Create ai_interactions table for logging AI usage
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_code TEXT NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'search',
  query TEXT,
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their AI interactions"
  ON public.ai_interactions FOR SELECT USING (true);

CREATE POLICY "Users can create AI interactions"
  ON public.ai_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete AI interactions"
  ON public.ai_interactions FOR DELETE USING (true);