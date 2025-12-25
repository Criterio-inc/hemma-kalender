-- Create table for storing push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_code TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can create push subscriptions"
ON public.push_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their push subscriptions"
ON public.push_subscriptions FOR SELECT
USING (true);

CREATE POLICY "Users can delete push subscriptions"
ON public.push_subscriptions FOR DELETE
USING (true);