import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Plus, ChevronLeft, Loader2, Search, Sparkles, X, 
  SlidersHorizontal, Clock, Timer, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSession, HouseholdSession } from "@/lib/auth";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import { useAI } from "@/hooks/useAI";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeForm from "@/components/recipes/RecipeForm";
import { RecipeGridSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { RecipeErrorFallback } from "@/components/errors";
import { TagFilter, TimeRangeSlider, SortDropdown } from "@/components/filters";
import { cn } from "@/lib/utils";
import { useDebounceWithLoading } from "@/hooks/useDebounce";

const categoryFilters = [
  { value: "all", label: "Alla" },
  { value: "main", label: "Huvudrätt" },
  { value: "dessert", label: "Dessert" },
  { value: "appetizer", label: "Förrätt" },
  { value: "side", label: "Tillbehör" },
  { value: "drink", label: "Dryck" },
  { value: "breakfast", label: "Frukost" },
  { value: "snack", label: "Mellanmål" },
];

const seasonalTags = ["Jul", "Påsk", "Midsommar", "Nyår", "Semester", "Vardag"];

const sortOptions = [
  { value: "name-asc", label: "Namn A-Ö" },
  { value: "name-desc", label: "Namn Ö-A" },
  { value: "date-desc", label: "Nyaste först" },
  { value: "date-asc", label: "Äldst först" },
  { value: "time-asc", label: "Snabbast först" },
  { value: "time-desc", label: "Längst tid först" },
];

const Recipes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedSearchQuery, isSearching] = useDebounceWithLoading(searchQuery, 300);
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tags = searchParams.get("tags");
    return tags ? tags.split(",") : [];
  });
  const [prepTimeRange, setPrepTimeRange] = useState<[number, number]>([0, 120]);
  const [cookTimeRange, setCookTimeRange] = useState<[number, number]>([0, 180]);
  const [servingsRange, setServingsRange] = useState<[number, number]>([1, 12]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date-desc");
  const [quickRecipesOnly, setQuickRecipesOnly] = useState(searchParams.get("quick") === "true");
  
  // AI Search state
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<Recipe[] | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const { searchRecipes, isLoading: aiLoading } = useAI();

  // Get all unique tags from recipes
  const { data: recipes = [], isLoading, error, refetch } = useRecipes(session?.householdCode || "");
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [recipes]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== "all") count++;
    if (selectedTags.length > 0) count++;
    if (prepTimeRange[0] > 0 || prepTimeRange[1] < 120) count++;
    if (cookTimeRange[0] > 0 || cookTimeRange[1] < 180) count++;
    if (servingsRange[0] > 1 || servingsRange[1] < 12) count++;
    if (quickRecipesOnly) count++;
    return count;
  }, [categoryFilter, selectedTags, prepTimeRange, cookTimeRange, servingsRange, quickRecipesOnly]);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (sortBy !== "date-desc") params.set("sort", sortBy);
    if (quickRecipesOnly) params.set("quick", "true");
    setSearchParams(params, { replace: true });
  }, [searchQuery, categoryFilter, selectedTags, sortBy, quickRecipesOnly, setSearchParams]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    if (aiResults !== null) return aiResults;
    
    let result = recipes.filter((recipe) => {
      // Text search
      const matchesSearch = !debouncedSearchQuery || 
        recipe.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        recipe.tags?.some((t) => t.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;
      
      // Tag filter (AND logic - must have all selected tags)
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recipe.tags?.includes(tag));
      
      // Time filters
      const prepTime = recipe.prep_time || 0;
      const cookTime = recipe.cook_time || 0;
      const matchesPrepTime = prepTime >= prepTimeRange[0] && prepTime <= prepTimeRange[1];
      const matchesCookTime = cookTime >= cookTimeRange[0] && cookTime <= cookTimeRange[1];
      
      // Servings filter
      const servings = recipe.servings || 4;
      const matchesServings = servings >= servingsRange[0] && servings <= servingsRange[1];
      
      // Quick recipes (< 30 min total)
      const totalTime = prepTime + cookTime;
      const matchesQuick = !quickRecipesOnly || totalTime <= 30;
      
      return matchesSearch && matchesCategory && matchesTags && 
             matchesPrepTime && matchesCookTime && matchesServings && matchesQuick;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title, 'sv');
        case "name-desc":
          return b.title.localeCompare(a.title, 'sv');
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "time-asc":
          return ((a.prep_time || 0) + (a.cook_time || 0)) - ((b.prep_time || 0) + (b.cook_time || 0));
        case "time-desc":
          return ((b.prep_time || 0) + (b.cook_time || 0)) - ((a.prep_time || 0) + (a.cook_time || 0));
        default:
          return 0;
      }
    });

    return result;
  }, [recipes, debouncedSearchQuery, categoryFilter, selectedTags, prepTimeRange, cookTimeRange, servingsRange, quickRecipesOnly, sortBy, aiResults]);

  const handleAISearch = async () => {
    if (!aiQuery.trim() || !session) return;
    
    const result = await searchRecipes(aiQuery, session.householdCode);
    if (result) {
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

  const clearAllFilters = () => {
    setCategoryFilter("all");
    setSelectedTags([]);
    setPrepTimeRange([0, 120]);
    setCookTimeRange([0, 180]);
    setServingsRange([1, 12]);
    setQuickRecipesOnly(false);
    setSortBy("date-desc");
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/calendar")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-foreground">Receptbank</h1>
                <p className="text-xs text-muted-foreground">{recipes.length} recept</p>
              </div>
            </div>

            <Button variant="hero" size="sm" onClick={() => { setEditingRecipe(null); setIsFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nytt recept</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-4 mb-6">
          {/* Search mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setAiSearchMode(false); clearAISearch(); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                !aiSearchMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Search className="w-4 h-4" />
              Sök
            </button>
            <button
              onClick={() => setAiSearchMode(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                aiSearchMode ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI-sökning
            </button>
          </div>

          {/* AI Search */}
          {aiSearchMode ? (
            <div className="space-y-3">
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                <Input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                  placeholder="Beskriv vad du letar efter..."
                  className="pl-10 pr-10"
                />
                {aiResults !== null && (
                  <button onClick={clearAISearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button onClick={handleAISearch} disabled={aiLoading || !aiQuery.trim()} className="w-full" variant="hero">
                {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Söker...</> : <><Sparkles className="w-4 h-4 mr-2" />Sök med AI</>}
              </Button>
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
              {/* Regular search with filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sök recept..."
                    className="pl-10 pr-10"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
                </div>
                
                {/* Filter button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <SlidersHorizontal className="w-5 h-5" />
                      {activeFilterCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center justify-between">
                        Filter
                        {activeFilterCount > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearAllFilters}>Rensa alla</Button>
                        )}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      {/* Quick recipes toggle */}
                      <button
                        onClick={() => setQuickRecipesOnly(!quickRecipesOnly)}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-xl border transition-colors",
                          quickRecipesOnly ? "bg-primary/10 border-primary" : "bg-muted/50 border-border"
                        )}
                      >
                        <Timer className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium">Snabba recept</p>
                          <p className="text-sm text-muted-foreground">Under 30 minuter</p>
                        </div>
                      </button>

                      {/* Prep time slider */}
                      <TimeRangeSlider label="Förberedningstid" value={prepTimeRange} onChange={setPrepTimeRange} max={120} />

                      {/* Cook time slider */}
                      <TimeRangeSlider label="Tillagningstid" value={cookTimeRange} onChange={setCookTimeRange} max={180} />

                      {/* Seasonal tags */}
                      <TagFilter label="Säsong" tags={seasonalTags} selectedTags={selectedTags} onTagsChange={setSelectedTags} />

                      {/* All tags */}
                      {allTags.length > 0 && (
                        <TagFilter label="Taggar" tags={allTags} selectedTags={selectedTags} onTagsChange={setSelectedTags} />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort dropdown */}
                <SortDropdown options={sortOptions} value={sortBy} onChange={setSortBy} />
              </div>

              {/* Category chips */}
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

              {/* Active filters display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quickRecipesOnly && (
                    <Badge variant="secondary" className="gap-1">
                      <Timer className="w-3 h-3" />
                      Snabba recept
                      <button onClick={() => setQuickRecipesOnly(false)}><X className="w-3 h-3" /></button>
                    </Badge>
                  )}
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Results indicator */}
        {aiResults !== null && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>AI hittade {aiResults.length} matchande recept</span>
          </div>
        )}

        {/* Results count */}
        {!isLoading && !aiResults && (
          <p className="text-sm text-muted-foreground mb-4">{filteredRecipes.length} recept</p>
        )}

        {/* Recipe grid */}
        {isLoading ? (
          <RecipeGridSkeleton count={6} />
        ) : error ? (
          <RecipeErrorFallback onRetry={refetch} />
        ) : filteredRecipes.length === 0 ? (
          <EmptyState
            type="recipes"
            title={aiResults !== null ? "Inga matchande recept" : activeFilterCount > 0 ? "Inga recept matchar filtren" : undefined}
            description={aiResults !== null ? "Prova att beskriva vad du letar efter på ett annat sätt" : activeFilterCount > 0 ? "Prova att ändra dina filter" : undefined}
            onAction={!searchQuery && activeFilterCount === 0 && !aiResults ? () => { setEditingRecipe(null); setIsFormOpen(true); } : undefined}
          />
        ) : (
          <motion.div 
            initial="hidden" animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredRecipes.map((recipe) => (
              <motion.div key={recipe.id} variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                <RecipeCard recipe={recipe} onClick={() => handleRecipeClick(recipe)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <RecipeForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingRecipe(null); }} householdCode={session.householdCode} recipe={editingRecipe} />
    </div>
  );
};

export default Recipes;
