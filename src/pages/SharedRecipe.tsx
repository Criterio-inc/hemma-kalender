import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Clock,
  Users,
  ChefHat,
  Home,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSharedRecipeByToken } from "@/hooks/useSharing";
import { toast } from "sonner";
import { useState } from "react";

const categoryLabels: Record<string, string> = {
  main: "Huvudrätt",
  appetizer: "Förrätt",
  dessert: "Efterrätt",
  side: "Tillbehör",
  drink: "Dryck",
};

const SharedRecipe = () => {
  const { token } = useParams<{ token: string }>();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useSharedRecipeByToken(token || "");

  const handleCopyRecipe = () => {
    if (!data?.recipe) return;

    const recipe = data.recipe;
    const ingredients = recipe.ingredients as any[] || [];
    
    const text = `${recipe.title}
    
${recipe.description || ""}

Ingredienser:
${ingredients.map((i: any) => `- ${i.amount} ${i.unit} ${i.name}`).join("\n")}

Instruktioner:
${recipe.instructions || ""}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Recept kopierat!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Laddar recept...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Receptet hittades inte</h1>
          <p className="text-muted-foreground mb-6">
            Den här delningslänken finns inte längre.
          </p>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Gå till startsidan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { recipe } = data;
  const ingredients = recipe.ingredients as any[] || [];
  const categoryLabel = categoryLabels[recipe.category || "main"] || "Recept";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Delat recept</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyRecipe}>
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Kopiera recept
              </Button>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-6">
        {/* Hero image */}
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-64 md:h-80 object-cover rounded-2xl mb-6"
          />
        )}

        {/* Title and meta */}
        <div className="mb-8">
          <Badge className="mb-3">{categoryLabel}</Badge>
          <h1 className="text-3xl font-bold mb-3">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          )}

          {/* Time and servings */}
          <div className="flex flex-wrap gap-4 mt-4">
            {recipe.prep_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{recipe.prep_time} min förb.</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{recipe.cook_time} min tillagning</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{recipe.servings} portioner</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {recipe.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Ingredienser</h2>
            <ul className="space-y-2">
              {ingredients.map((ing: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">
                    {ing.amount} {ing.unit}
                  </span>
                  <span>{ing.name}</span>
                  {ing.notes && (
                    <span className="text-muted-foreground text-sm">
                      ({ing.notes})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instruktioner</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{recipe.instructions}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedRecipe;
