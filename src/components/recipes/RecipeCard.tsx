import { memo } from "react";
import { Clock, Users, UtensilsCrossed } from "lucide-react";
import { Recipe } from "@/hooks/useRecipes";
import { LazyImage } from "@/components/ui/lazy-image";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const categoryLabels: Record<string, string> = {
  main: "Huvudrätt",
  dessert: "Dessert",
  appetizer: "Förrätt",
  side: "Tillbehör",
  drink: "Dryck",
  breakfast: "Frukost",
  snack: "Mellanmål",
};

const RecipeCard = memo(function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const displayTags = recipe.tags?.slice(0, 3) || [];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden",
        "transition-all duration-300 hover:shadow-lg hover:border-primary/30",
        "text-left w-full"
      )}
    >
      {/* Image */}
      <div className="aspect-square bg-muted overflow-hidden">
        {recipe.image_url ? (
          <LazyImage
            src={recipe.image_url}
            alt={recipe.title}
            aspectRatio="square"
            className="transition-transform duration-300 group-hover:scale-105"
            fallbackSrc="/placeholder.svg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category badge */}
        {recipe.category && (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
            {categoryLabels[recipe.category] || recipe.category}
          </span>
        )}

        {/* Title */}
        <h3 className="font-display font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings} port
            </span>
          )}
        </div>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {recipe.tags && recipe.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
});

export default RecipeCard;
