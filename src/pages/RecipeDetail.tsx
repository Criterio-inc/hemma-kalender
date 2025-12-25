import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  Users,
  Trash2,
  Edit2,
  Share2,
  CalendarPlus,
  Loader2,
  Check,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSession, HouseholdSession } from "@/lib/auth";
import { useRecipe, useDeleteRecipe, Ingredient } from "@/hooks/useRecipes";
import RecipeForm from "@/components/recipes/RecipeForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  main: "Huvudrätt",
  dessert: "Dessert",
  appetizer: "Förrätt",
  side: "Tillbehör",
  drink: "Dryck",
  breakfast: "Frukost",
  snack: "Mellanmål",
};

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const { data: recipe, isLoading, error } = useRecipe(id || "");
  const deleteRecipe = useDeleteRecipe();

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const handleDelete = async () => {
    if (!recipe) return;
    
    try {
      await deleteRecipe.mutateAsync(recipe.id);
      toast.success("Recept borttaget!");
      navigate("/recipes");
    } catch (error) {
      toast.error("Kunde inte ta bort receptet");
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const handleShare = async () => {
    if (!recipe) return;
    
    const shareData = {
      title: recipe.title,
      text: recipe.description || `Kolla in detta recept: ${recipe.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Länk kopierad!");
      }
    } catch (error) {
      // User cancelled share
    }
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
          <div className="container max-w-3xl mx-auto px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/recipes")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Receptet hittades inte
          </h3>
          <Button variant="outline" onClick={() => navigate("/recipes")}>
            Tillbaka till recept
          </Button>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-64 md:h-80 bg-muted">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <BookOpen className="w-20 h-20 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
          onClick={() => navigate("/recipes")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 -mt-16 relative z-10 pb-8">
        {/* Title card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg mb-6">
          {/* Category */}
          {recipe.category && (
            <Badge variant="secondary" className="mb-3">
              {categoryLabels[recipe.category] || recipe.category}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            {recipe.title}
          </h1>

          {/* Description */}
          {recipe.description && (
            <p className="text-muted-foreground mb-4">{recipe.description}</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {recipe.prep_time && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Förb: {recipe.prep_time} min
              </span>
            )}
            {recipe.cook_time && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Tillagning: {recipe.cook_time} min
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5 font-medium text-primary">
                <Clock className="w-4 h-4" />
                Totalt: {totalTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                {recipe.servings} portioner
              </span>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-foreground">
                Ingredienser
              </h2>
              <span className="text-sm text-muted-foreground">
                {checkedIngredients.size}/{recipe.ingredients.length} avbockade
              </span>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <button
                  key={index}
                  onClick={() => toggleIngredient(index)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    "hover:bg-muted/50",
                    checkedIngredients.has(index) && "bg-success/10"
                  )}
                >
                  <Checkbox
                    checked={checkedIngredients.has(index)}
                    className={cn(
                      "h-5 w-5 rounded-full",
                      "data-[state=checked]:bg-success data-[state=checked]:border-success"
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1",
                      checkedIngredients.has(index) && "line-through text-muted-foreground"
                    )}
                  >
                    <span className="font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </span>{" "}
                    {ingredient.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">
              Instruktioner
            </h2>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {recipe.instructions}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Ta bort
          </Button>
          <Button variant="hero" onClick={() => setIsFormOpen(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Redigera
          </Button>
        </div>
      </main>

      {/* Edit form */}
      <RecipeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        householdCode={session.householdCode}
        recipe={recipe}
      />

      {/* Delete dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort recept?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort "{recipe.title}"? Detta kan inte
              ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecipe.isPending ? "Tar bort..." : "Ta bort"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecipeDetail;
