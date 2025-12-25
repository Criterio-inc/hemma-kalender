import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, ChevronLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession, HouseholdSession } from "@/lib/auth";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeForm from "@/components/recipes/RecipeForm";
import { cn } from "@/lib/utils";

const categoryFilters = [
  { value: "all", label: "Alla" },
  { value: "main", label: "Huvudrätt" },
  { value: "dessert", label: "Dessert" },
  { value: "appetizer", label: "Förrätt" },
  { value: "side", label: "Tillbehör" },
  { value: "drink", label: "Dryck" },
];

const Recipes = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const { data: recipes = [], isLoading, error } = useRecipes(session?.householdCode || "");

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleAdd = () => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/calendar")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-foreground">
                  Receptbank
                </h1>
                <p className="text-xs text-muted-foreground">
                  {recipes.length} recept
                </p>
              </div>
            </div>

            <Button variant="hero" size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nytt recept</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        {/* Search and filters */}
        <div className="space-y-4 mb-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök recept..."
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categoryFilters.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  categoryFilter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive font-medium">
              Kunde inte hämta recept
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Försök igen
            </Button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || categoryFilter !== "all"
                ? "Inga recept hittades"
                : "Inga recept än"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all"
                ? "Prova att ändra din sökning"
                : "Skapa ditt första recept!"}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Button variant="hero" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Skapa recept
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Recipe form modal */}
      <RecipeForm
        isOpen={isFormOpen}
        onClose={handleClose}
        householdCode={session.householdCode}
        recipe={editingRecipe}
      />
    </div>
  );
};

export default Recipes;
