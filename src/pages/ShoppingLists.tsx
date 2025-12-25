import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useShoppingLists,
  useCreateShoppingList,
  useShoppingListItems,
  ShoppingList,
} from "@/hooks/useShoppingLists";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import ShoppingListDetail from "@/components/shopping/ShoppingListDetail";
import { NavLink } from "react-router-dom";
import { Calendar, ListTodo, BookOpen, ShoppingCart as ShoppingIcon, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Wrapper component to get item counts
function ShoppingListCardWithCounts({
  list,
  onClick,
}: {
  list: ShoppingList;
  onClick: () => void;
}) {
  const { data: items = [] } = useShoppingListItems(list.id);
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <ShoppingListCard
      list={list}
      itemCount={items.length}
      checkedCount={checkedCount}
      onClick={onClick}
    />
  );
}

export default function ShoppingLists() {
  const navigate = useNavigate();
  const [session, setSession] = useState<{
    household_code: string;
    household_name: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("household_session");
    if (stored) {
      setSession(JSON.parse(stored));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const { data: lists = [], isLoading } = useShoppingLists(
    session?.household_code || ""
  );
  const createList = useCreateShoppingList();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !session) {
      toast.error("Ange en titel");
      return;
    }

    try {
      await createList.mutateAsync({
        household_code: session.household_code,
        title: newTitle.trim(),
        created_from: "manual",
      });
      setNewTitle("");
      setIsCreating(false);
      toast.success("Inköpslista skapad!");
    } catch {
      toast.error("Kunde inte skapa lista");
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/calendar")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-primary" />
                Inköpslistor
              </h1>
              <p className="text-sm text-muted-foreground">
                {session.household_name}
              </p>
            </div>
          </div>

          {!selectedList && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ny lista
            </Button>
          )}
        </header>

        {/* Content */}
        {selectedList ? (
          <ShoppingListDetail
            list={selectedList}
            onBack={() => setSelectedList(null)}
          />
        ) : (
          <>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-12">
                Laddar...
              </p>
            ) : lists.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Inga inköpslistor ännu
                </h2>
                <p className="text-muted-foreground mb-4">
                  Skapa din första inköpslista för att komma igång.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Skapa lista
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {lists.map((list) => (
                  <ShoppingListCardWithCounts
                    key={list.id}
                    list={list}
                    onClick={() => setSelectedList(list)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border py-2 px-4">
          <div className="max-w-4xl mx-auto flex justify-around">
            <NavLink to="/calendar" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Kalender</span>
            </NavLink>
            <NavLink to="/todos" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <ListTodo className="w-5 h-5" />
              <span className="text-xs">Todos</span>
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Recept</span>
            </NavLink>
            <NavLink to="/shopping" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <ShoppingIcon className="w-5 h-5" />
              <span className="text-xs">Inköp</span>
            </NavLink>
            <NavLink to="/meal-plan" className={({ isActive }) => cn("flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Utensils className="w-5 h-5" />
              <span className="text-xs">Måltider</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Create dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ny inköpslista</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="T.ex. Julmat, Vardagsinköp..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={createList.isPending}>
                {createList.isPending ? "Skapar..." : "Skapa"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
