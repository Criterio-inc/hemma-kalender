import { useNavigate } from "react-router-dom";
import { Calendar, CheckSquare, UtensilsCrossed, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isToday, startOfWeek, endOfWeek } from "date-fns";
import { sv } from "date-fns/locale";
import { useEvents, Event } from "@/hooks/useEvents";
import { useTodos } from "@/hooks/useTodos";
import { useMealPlan, useMealPlanItems } from "@/hooks/useMealPlans";
import { useRecipes } from "@/hooks/useRecipes";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickAccessWidgetsProps {
  householdCode: string;
}

const QuickAccessWidgets = ({ householdCode }: QuickAccessWidgetsProps) => {
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  // Fetch data
  const { data: events = [], isLoading: eventsLoading } = useEvents(
    householdCode,
    today
  );
  const { data: todos = [], isLoading: todosLoading } = useTodos(householdCode);
  const { data: mealPlan } = useMealPlan(
    householdCode,
    weekStart
  );
  const { data: mealPlanItems = [] } = useMealPlanItems(mealPlan?.id || "");
  const { data: recipes = [], isLoading: recipesLoading } = useRecipes(householdCode);

  // Get next upcoming event
  const upcomingEvents = events
    .filter((e) => new Date(e.start_date) >= today)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  const nextEvent = upcomingEvents[0];

  // Get today's todos
  const todayTodos = todos.filter((t) => {
    if (t.completed) return false;
    if (!t.due_date) return false;
    return isToday(new Date(t.due_date));
  });
  const pendingTodosCount = todos.filter((t) => !t.completed).length;

  // Get today's meals
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayMeals = mealPlanItems.filter((m) => m.day_of_week === dayOfWeek);

  // Recent recipes (last 3)
  const recentRecipes = recipes.slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Next Event Widget */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate("/events")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Nästa händelse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : nextEvent ? (
            <div>
              <p className="font-semibold text-foreground truncate">
                {nextEvent.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(nextEvent.start_date), "d MMM HH:mm", {
                  locale: sv,
                })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Inga kommande händelser</p>
          )}
        </CardContent>
      </Card>

      {/* Today's Todos Widget */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate("/todos")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-accent" />
            Att göra idag
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todosLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div>
              <p className="font-semibold text-foreground">
                {pendingTodosCount} uppgifter kvar
              </p>
              {todayTodos.slice(0, 2).map((todo) => (
                <p
                  key={todo.id}
                  className="text-sm text-muted-foreground truncate"
                >
                  • {todo.title}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Meals Widget */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate("/meal-plan")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-success" />
            Dagens måltider
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayMeals.length > 0 ? (
            <div className="space-y-1">
              {todayMeals.slice(0, 2).map((meal) => (
                <p
                  key={meal.id}
                  className="text-sm text-foreground truncate"
                >
                  <span className="text-muted-foreground capitalize">
                    {meal.meal_type}:
                  </span>{" "}
                  {meal.custom_meal_name || "Recept"}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ingen matsedel planerad</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Recipes Widget */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate("/recipes")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-warning" />
            Senaste recept
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recipesLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : recentRecipes.length > 0 ? (
            <div className="space-y-1">
              {recentRecipes.map((recipe) => (
                <p
                  key={recipe.id}
                  className="text-sm text-foreground truncate"
                >
                  {recipe.title}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Inga recept ännu</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAccessWidgets;
