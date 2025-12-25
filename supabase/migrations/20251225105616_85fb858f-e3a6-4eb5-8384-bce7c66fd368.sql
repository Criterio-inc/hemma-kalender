-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  total_budget DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'SEK',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

-- Create budget_items table
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'other',
  description TEXT,
  estimated_cost DECIMAL(12,2) DEFAULT 0,
  actual_cost DECIMAL(12,2) DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status TEXT DEFAULT 'pending',
  plus_one BOOLEAN DEFAULT false,
  dietary_requirements TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- RLS policies for budgets
CREATE POLICY "Users can view budgets" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Users can create budgets" ON public.budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budgets" ON public.budgets FOR UPDATE USING (true);
CREATE POLICY "Users can delete budgets" ON public.budgets FOR DELETE USING (true);

-- RLS policies for budget_items
CREATE POLICY "Users can view budget items" ON public.budget_items FOR SELECT USING (true);
CREATE POLICY "Users can create budget items" ON public.budget_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget items" ON public.budget_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget items" ON public.budget_items FOR DELETE USING (true);

-- RLS policies for guests
CREATE POLICY "Users can view guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Users can create guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Users can delete guests" ON public.guests FOR DELETE USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();