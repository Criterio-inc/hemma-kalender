-- Create household_preferences table to store settings
CREATE TABLE public.household_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_code TEXT NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{
    "notifications_enabled": true,
    "default_reminder_times": [1440, 60],
    "theme_auto": true,
    "dark_mode": "auto",
    "calendar_view": "month",
    "start_of_week": 1,
    "time_format": "24h",
    "date_format": "YYYY-MM-DD",
    "default_event_duration": 60,
    "default_event_color": null,
    "ai_enabled": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.household_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their household preferences"
  ON public.household_preferences
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create household preferences"
  ON public.household_preferences
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their household preferences"
  ON public.household_preferences
  FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_household_preferences_updated_at
  BEFORE UPDATE ON public.household_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();