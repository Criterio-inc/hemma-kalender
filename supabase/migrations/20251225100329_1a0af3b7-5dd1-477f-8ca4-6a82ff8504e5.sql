-- Create households table for storing household codes and passwords
CREATE TABLE public.households (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_code text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    household_name text DEFAULT 'Min Familj',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read households (for login verification - password checked server-side)
CREATE POLICY "Allow reading households for login" 
ON public.households 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_households_updated_at
    BEFORE UPDATE ON public.households
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();