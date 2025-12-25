-- Shopping Lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_code TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_from TEXT DEFAULT 'manual',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shopping List Items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'other',
  checked BOOLEAN DEFAULT false,
  checked_by UUID,
  checked_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Meal Plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_code TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Meal Plan Items table
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL,
  meal_type TEXT NOT NULL,
  custom_meal_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Shopping Lists policies
CREATE POLICY "Users can view shopping lists" ON public.shopping_lists FOR SELECT USING (true);
CREATE POLICY "Users can create shopping lists" ON public.shopping_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update shopping lists" ON public.shopping_lists FOR UPDATE USING (true);
CREATE POLICY "Users can delete shopping lists" ON public.shopping_lists FOR DELETE USING (true);

-- Shopping List Items policies
CREATE POLICY "Users can view shopping list items" ON public.shopping_list_items FOR SELECT USING (true);
CREATE POLICY "Users can create shopping list items" ON public.shopping_list_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update shopping list items" ON public.shopping_list_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete shopping list items" ON public.shopping_list_items FOR DELETE USING (true);

-- Meal Plans policies
CREATE POLICY "Users can view meal plans" ON public.meal_plans FOR SELECT USING (true);
CREATE POLICY "Users can create meal plans" ON public.meal_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update meal plans" ON public.meal_plans FOR UPDATE USING (true);
CREATE POLICY "Users can delete meal plans" ON public.meal_plans FOR DELETE USING (true);

-- Meal Plan Items policies
CREATE POLICY "Users can view meal plan items" ON public.meal_plan_items FOR SELECT USING (true);
CREATE POLICY "Users can create meal plan items" ON public.meal_plan_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update meal plan items" ON public.meal_plan_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete meal plan items" ON public.meal_plan_items FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();