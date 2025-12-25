import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { sv } from "date-fns/locale";
import { Plus, X, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MealPlanItemWithRecipe,
  useAddMealPlanItem,
  useDeleteMealPlanItem,
} from "@/hooks/useMealPlans";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const mealTypes = [
  { value: "breakfast", label: "Frukost" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Middag" },
  { value: "snack", label: "Mellanmål" },
];

const dayLabels = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

interface MealPlanGridProps {
  mealPlanId: string;
  items: MealPlanItemWithRecipe[];
  weekStart: Date;
  householdCode: string;
}

export default function MealPlanGrid({
  mealPlanId,
  items,
  weekStart,
  householdCode,
}: MealPlanGridProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addingCell, setAddingCell] = useState<{
    day: number;
    meal: string;
  } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [customMealName, setCustomMealName] = useState("");

  const { data: recipes = [] } = useRecipes(householdCode);
  const addItem = useAddMealPlanItem();
  const deleteItem = useDeleteMealPlanItem();

  const getMealItem = (day: number, mealType: string) => {
    return items.find(
      (item) => item.day_of_week === day && item.meal_type === mealType
    );
  };

  const handleCellClick = (day: number, meal: string) => {
    const existing = getMealItem(day, meal);
    if (!existing) {
      setAddingCell({ day, meal });
      setIsAdding(true);
    }
  };

  const handleAddMeal = async () => {
    if (!addingCell) return;

    if (!selectedRecipeId && !customMealName.trim()) {
      toast.error("Välj ett recept eller ange ett namn");
      return;
    }

    try {
      await addItem.mutateAsync({
        meal_plan_id: mealPlanId,
        day_of_week: addingCell.day,
        meal_type: addingCell.meal,
        recipe_id: selectedRecipeId || null,
        custom_meal_name: customMealName.trim() || null,
      });
      setIsAdding(false);
      setSelectedRecipeId("");
      setCustomMealName("");
      setAddingCell(null);
    } catch {
      toast.error("Kunde inte lägga till måltid");
    }
  };

  const handleDeleteMeal = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync({ id: itemId, mealPlanId });
    } catch {
      toast.error("Kunde inte ta bort");
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid grid-cols-8 gap-1 mb-1">
            <div className="p-2" />
            {dayLabels.map((day, i) => {
              const date = addDays(weekStart, i);
              const isToday =
                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div
                  key={i}
                  className={cn(
                    "p-2 text-center rounded-lg",
                    isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  <div className="font-semibold text-sm">{day}</div>
                  <div className="text-xs opacity-80">
                    {format(date, "d/M")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meal rows */}
          {mealTypes.map((meal) => (
            <div key={meal.value} className="grid grid-cols-8 gap-1 mb-1">
              <div className="p-2 flex items-center justify-end">
                <span className="text-sm font-medium text-muted-foreground">
                  {meal.label}
                </span>
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const item = getMealItem(day, meal.value);
                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-[80px] p-2 rounded-lg border transition-all",
                      item
                        ? "bg-card"
                        : "bg-muted/30 border-dashed hover:bg-muted/50 cursor-pointer"
                    )}
                    onClick={() =>
                      !item && handleCellClick(day, meal.value)
                    }
                  >
                    {item ? (
                      <div className="relative h-full group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(item.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        {item.recipes ? (
                          <div>
                            {item.recipes.image_url && (
                              <img
                                src={item.recipes.image_url}
                                alt={item.recipes.title}
                                className="w-full h-10 object-cover rounded mb-1"
                              />
                            )}
                            <p className="text-xs font-medium line-clamp-2">
                              {item.recipes.title}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs line-clamp-2">
                              {item.custom_meal_name}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add meal dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Lägg till måltid -{" "}
              {addingCell &&
                `${dayLabels[addingCell.day]} ${
                  mealTypes.find((m) => m.value === addingCell.meal)?.label
                }`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Välj recept
              </label>
              <Select
                value={selectedRecipeId}
                onValueChange={(val) => {
                  setSelectedRecipeId(val);
                  if (val) setCustomMealName("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj från receptbanken..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">eller</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Skriv in måltid
              </label>
              <Input
                placeholder="T.ex. Tacos, Resterna..."
                value={customMealName}
                onChange={(e) => {
                  setCustomMealName(e.target.value);
                  if (e.target.value) setSelectedRecipeId("");
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Avbryt
              </Button>
              <Button onClick={handleAddMeal} disabled={addItem.isPending}>
                {addItem.isPending ? "Lägger till..." : "Lägg till"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
