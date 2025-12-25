import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { ShoppingCart, Calendar, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingList } from "@/hooks/useShoppingLists";

interface ShoppingListCardProps {
  list: ShoppingList;
  itemCount: number;
  checkedCount: number;
  onClick: () => void;
}

export default function ShoppingListCard({
  list,
  itemCount,
  checkedCount,
  onClick,
}: ShoppingListCardProps) {
  const progress = itemCount > 0 ? (checkedCount / itemCount) * 100 : 0;
  const isComplete = itemCount > 0 && checkedCount === itemCount;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isComplete
                  ? "bg-green-100 text-green-600"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{list.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {format(new Date(list.created_at), "d MMM yyyy", {
                    locale: sv,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Circle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                {checkedCount}/{itemCount}
              </span>
            </div>
          </div>
        </div>

        {itemCount > 0 && (
          <div className="mt-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isComplete ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {list.created_from && list.created_from !== "manual" && (
          <div className="mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
              {list.created_from === "recipe"
                ? "Från recept"
                : list.created_from === "ai"
                ? "AI-genererad"
                : list.created_from}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
