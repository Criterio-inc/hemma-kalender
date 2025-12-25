import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Plus, ChevronLeft, Loader2, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession, HouseholdSession } from "@/lib/auth";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import { useAI } from "@/hooks/useAI";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeForm from "@/components/recipes/RecipeForm";
import { RecipeGridSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
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
  
  // AI Search state
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<Recipe[] | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const { searchRecipes, isLoading: aiLoading } = useAI();

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const { data: recipes = [], isLoading, error } = useRecipes(session?.householdCode || "");

  // Filter recipes (only when not in AI mode)
  const filteredRecipes = aiResults !== null ? aiResults : recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleAISearch = async () => {
    if (!aiQuery.trim() || !session) return;
    
    const result = await searchRecipes(aiQuery, session.householdCode);
    if (result) {
      // Map AI results to full recipe objects
      const matchedRecipes = result.results.map(r => {
        const fullRecipe = recipes.find(rec => rec.id === r.id);
        return fullRecipe ? { ...fullRecipe, aiReason: r.reason } : null;
      }).filter(Boolean) as Recipe[];
      
      setAiResults(matchedRecipes);
      setAiSuggestion(result.suggestion || null);
    }
  };

  const clearAISearch = () => {
    setAiResults(null);
    setAiQuery("");
    setAiSuggestion(null);
    setAiSearchMode(false);
  };

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
          {/* Search mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setAiSearchMode(false); clearAISearch(); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                !aiSearchMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Search className="w-4 h-4" />
              Vanlig sökning
            </button>
            <button
              onClick={() => setAiSearchMode(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                aiSearchMode
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI-sökning
            </button>
          </div>

          {/* Search bar */}
          {aiSearchMode ? (
            <div className="space-y-3">
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                <Input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                  placeholder="Beskriv vad du letar efter... t.ex. 'sillinläggning från julen' eller 'något snabbt med pasta'"
                  className="pl-10 pr-10"
                />
                {aiResults !== null && (
                  <button
                    onClick={clearAISearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button 
                onClick={handleAISearch} 
                disabled={aiLoading || !aiQuery.trim()}
                className="w-full"
                variant="hero"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Söker med AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sök med AI
                  </>
                )}
              </Button>
              
              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{aiSuggestion}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Results indicator for AI search */}
        {aiResults !== null && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>AI hittade {aiResults.length} matchande recept</span>
          </div>
        )}

        {/* Recipe grid */}
        {isLoading ? (
          <RecipeGridSkeleton count={6} />
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
          <EmptyState
            type="recipes"
            title={aiResults !== null ? "Inga matchande recept" : undefined}
            description={
              aiResults !== null
                ? "Prova att beskriva vad du letar efter på ett annat sätt"
                : searchQuery || categoryFilter !== "all"
                ? "Prova att ändra din sökning"
                : undefined
            }
            onAction={!searchQuery && categoryFilter === "all" && aiResults === null ? handleAdd : undefined}
          />
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <RecipeCard
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                />
              </motion.div>
            ))}
          </motion.div>
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
