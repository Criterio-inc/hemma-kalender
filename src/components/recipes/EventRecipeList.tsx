import { useState } from "react";
import { BookOpen, Plus, Trash2, Clock, Users, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  useRecipes,
  useEventRecipes,
  useAddRecipeToEvent,
  useRemoveRecipeFromEvent,
  EventRecipe,
  Recipe,
} from "@/hooks/useRecipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface EventRecipeListProps {
  eventId: string;
  householdCode: string;
}

const mealTypes = [
  { value: "breakfast", label: "Frukost" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Middag" },
  { value: "snack", label: "Mellanmål" },
  { value: "dessert", label: "Dessert" },
];

const EventRecipeList = ({ eventId, householdCode }: EventRecipeListProps) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>("dinner");

  const { data: eventRecipes = [], isLoading } = useEventRecipes(eventId);
  const { data: allRecipes = [] } = useRecipes(householdCode);
  const addRecipeToEvent = useAddRecipeToEvent();
  const removeRecipeFromEvent = useRemoveRecipeFromEvent();

  // Filter out recipes already added to event
  const availableRecipes = allRecipes.filter(
    (r) => !eventRecipes.some((er) => er.recipe_id === r.id)
  );

  const handleAddRecipe = async () => {
    if (!selectedRecipeId) {
      toast.error("Välj ett recept");
      return;
    }

    try {
      await addRecipeToEvent.mutateAsync({
        event_id: eventId,
        recipe_id: selectedRecipeId,
        meal_type: selectedMealType,
      });
      toast.success("Recept tillagt!");
      setIsAddModalOpen(false);
      setSelectedRecipeId("");
    } catch (error) {
      toast.error("Kunde inte lägga till receptet");
    }
  };

  const handleRemoveRecipe = async (id: string) => {
    try {
      await removeRecipeFromEvent.mutateAsync(id);
      toast.success("Recept borttaget");
    } catch (error) {
      toast.error("Kunde inte ta bort receptet");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Recept</h4>
          <span className="text-sm text-muted-foreground">
            ({eventRecipes.length})
          </span>
        </div>
        <Button variant="hero" size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Lägg till
        </Button>
      </div>

      {/* Content */}
      {eventRecipes.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Inga recept för denna händelse</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till recept
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {eventRecipes.map((er) => (
            <EventRecipeItem
              key={er.id}
              eventRecipe={er}
              onRemove={() => handleRemoveRecipe(er.id)}
              onViewRecipe={() => er.recipe && navigate(`/recipe/${er.recipe.id}`)}
            />
          ))}
        </div>
      )}

      {/* Add Recipe Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lägg till recept</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {availableRecipes.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-muted-foreground mb-3">
                  Inga fler recept att lägga till
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    navigate("/recipes");
                  }}
                >
                  Skapa nytt recept
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Välj recept</Label>
                  <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj ett recept..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {availableRecipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Måltid</Label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {mealTypes.map((mt) => (
                        <SelectItem key={mt.value} value={mt.value}>
                          {mt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1"
                  >
                    Avbryt
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleAddRecipe}
                    disabled={!selectedRecipeId || addRecipeToEvent.isPending}
                    className="flex-1"
                  >
                    {addRecipeToEvent.isPending ? "Lägger till..." : "Lägg till"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Event recipe item component
const EventRecipeItem = ({
  eventRecipe,
  onRemove,
  onViewRecipe,
}: {
  eventRecipe: EventRecipe;
  onRemove: () => void;
  onViewRecipe: () => void;
}) => {
  const recipe = eventRecipe.recipe;
  const mealLabel = mealTypes.find((m) => m.value === eventRecipe.meal_type)?.label || "Måltid";
  const totalTime = recipe ? (recipe.prep_time || 0) + (recipe.cook_time || 0) : 0;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
        "transition-all duration-200 hover:shadow-md hover:border-primary/20"
      )}
    >
      {/* Image */}
      <button
        onClick={onViewRecipe}
        className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0"
      >
        {recipe?.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <UtensilsCrossed className="w-6 h-6 text-muted-foreground/40" />
          </div>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <button
          onClick={onViewRecipe}
          className="font-medium text-foreground hover:text-primary transition-colors text-left"
        >
          {recipe?.title || "Okänt recept"}
        </button>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {mealLabel}
          </span>
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalTime} min
            </span>
          )}
          {recipe?.servings && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {recipe.servings}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default EventRecipeList;
