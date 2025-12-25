import { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useEventShoppingLists,
  useCreateShoppingList,
  useShoppingListItems,
} from "@/hooks/useShoppingLists";
import ShoppingListCard from "./ShoppingListCard";
import ShoppingListDetail from "./ShoppingListDetail";
import { toast } from "sonner";

interface EventShoppingListsProps {
  eventId: string;
  householdCode: string;
}

// Wrapper to get item counts for a list
function ShoppingListCardWithCounts({
  list,
  onClick,
}: {
  list: any;
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

export default function EventShoppingLists({
  eventId,
  householdCode,
}: EventShoppingListsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedList, setSelectedList] = useState<any>(null);

  const { data: lists = [], isLoading } = useEventShoppingLists(eventId);
  const createList = useCreateShoppingList();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Ange en titel");
      return;
    }

    try {
      await createList.mutateAsync({
        household_code: householdCode,
        event_id: eventId,
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

  if (selectedList) {
    return (
      <ShoppingListDetail
        list={selectedList}
        onBack={() => setSelectedList(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Inköpslistor
        </h3>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Ny lista
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Laddar...</p>
      ) : lists.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Inga inköpslistor för detta event ännu.
        </p>
      ) : (
        <div className="grid gap-3">
          {lists.map((list) => (
            <ShoppingListCardWithCounts
              key={list.id}
              list={list}
              onClick={() => setSelectedList(list)}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ny inköpslista</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Listans namn"
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
