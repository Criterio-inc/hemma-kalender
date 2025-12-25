import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addWeeks, subWeeks, startOfWeek } from "date-fns";
import { sv } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useMealPlan,
  useMealPlanItems,
  useCreateMealPlan,
} from "@/hooks/useMealPlans";
import {
  useCreateShoppingList,
  useAddShoppingListItem,
} from "@/hooks/useShoppingLists";
import { useRecipes, Ingredient } from "@/hooks/useRecipes";
import MealPlanGrid from "@/components/mealplan/MealPlanGrid";
import { NavLink } from "react-router-dom";
import { Calendar as CalIcon, ListTodo, BookOpen, ShoppingCart as ShoppingIcon, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MealPlan() {
  const navigate = useNavigate();
  const [session, setSession] = useState<{
    household_code: string;
    household_name: string;
  } | null>(null);
  const [currentWeek, setCurrentWeek] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("household_session");
    if (stored) {
      setSession(JSON.parse(stored));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const { data: mealPlan, isLoading: loadingPlan } = useMealPlan(
    session?.household_code || "",
    currentWeek
  );
  const { data: mealPlanItems = [], isLoading: loadingItems } = useMealPlanItems(
    mealPlan?.id
  );
  const { data: recipes = [] } = useRecipes(session?.household_code || "");
  const createMealPlan = useCreateMealPlan();
  const createShoppingList = useCreateShoppingList();
  const addShoppingItem = useAddShoppingListItem();

  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleToday = () =>
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Create meal plan if it doesn't exist
  useEffect(() => {
    if (session && !loadingPlan && !mealPlan) {
      createMealPlan.mutate({
        household_code: session.household_code,
        week_start_date: format(currentWeek, "yyyy-MM-dd"),
      });
    }
  }, [session, loadingPlan, mealPlan, currentWeek]);

  const handleGenerateShoppingList = async () => {
    if (!session || !mealPlan) return;

    // Get all recipes used this week
    const recipeIds = mealPlanItems
      .filter((item) => item.recipe_id)
      .map((item) => item.recipe_id!);

    if (recipeIds.length === 0) {
      toast.error("Inga recept i veckans måltidsplan");
      return;
    }

    const usedRecipes = recipes.filter((r) => recipeIds.includes(r.id));

    // Collect all ingredients
    const allIngredients: { name: string; quantity: string }[] = [];
    usedRecipes.forEach((recipe) => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        (recipe.ingredients as Ingredient[]).forEach((ing) => {
          allIngredients.push({
            name: ing.name,
            quantity: `${ing.quantity} ${ing.unit}`.trim(),
          });
        });
      }
    });

    if (allIngredients.length === 0) {
      toast.error("Inga ingredienser hittades i recepten");
      return;
    }

    try {
      // Create shopping list
      const weekLabel = format(currentWeek, "'Vecka' w", { locale: sv });
      const list = await createShoppingList.mutateAsync({
        household_code: session.household_code,
        title: `${weekLabel} - Måltidsplan`,
        created_from: "recipe",
      });

      // Add items
      for (const ing of allIngredients) {
        await addShoppingItem.mutateAsync({
          shopping_list_id: list.id,
          item_name: ing.name,
          quantity: ing.quantity,
          category: "other",
        });
      }

      toast.success("Inköpslista skapad!");
      navigate("/shopping");
    } catch {
      toast.error("Kunde inte skapa inköpslista");
    }
  };

  if (!session) return null;

  const isLoading = loadingPlan || loadingItems;
  const weekLabel = format(currentWeek, "'Vecka' w, yyyy", { locale: sv });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/calendar")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Måltidsplanering
              </h1>
              <p className="text-sm text-muted-foreground">
                {session.household_name}
              </p>
            </div>
          </div>

          <Button onClick={handleGenerateShoppingList} variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Skapa inköpslista
          </Button>
        </header>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-6 bg-card rounded-xl p-3 border">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">{weekLabel}</span>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Idag
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Meal plan grid */}
        {isLoading || !mealPlan ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Laddar...</p>
          </div>
        ) : (
          <MealPlanGrid
            mealPlanId={mealPlan.id}
            items={mealPlanItems}
            weekStart={currentWeek}
            householdCode={session.household_code}
          />
        )}

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border py-2 px-4">
          <div className="max-w-4xl mx-auto flex justify-around">
            <NavLink to="/calendar" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <CalIcon className="w-5 h-5" />
              <span className="text-xs">Kalender</span>
            </NavLink>
            <NavLink to="/todos" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <ListTodo className="w-5 h-5" />
              <span className="text-xs">Todos</span>
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Recept</span>
            </NavLink>
            <NavLink to="/shopping" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <ShoppingIcon className="w-5 h-5" />
              <span className="text-xs">Inköp</span>
            </NavLink>
            <NavLink to="/meal-plan" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Utensils className="w-5 h-5" />
              <span className="text-xs">Måltider</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
