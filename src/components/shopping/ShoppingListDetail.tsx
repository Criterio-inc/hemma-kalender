import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Share2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingList,
  ShoppingListItem,
  useShoppingListItems,
  useUpdateShoppingList,
  useAddShoppingListItem,
  useUpdateShoppingListItem,
  useToggleShoppingListItem,
  useDeleteShoppingListItem,
} from "@/hooks/useShoppingLists";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categories = [
  { value: "dairy", label: "Mejeri" },
  { value: "meat", label: "Kött & Fisk" },
  { value: "vegetables", label: "Grönsaker & Frukt" },
  { value: "pantry", label: "Skafferi" },
  { value: "frozen", label: "Fryst" },
  { value: "bakery", label: "Bageri" },
  { value: "beverages", label: "Drycker" },
  { value: "other", label: "Övrigt" },
];

interface ShoppingListDetailProps {
  list: ShoppingList;
  onBack: () => void;
}

export default function ShoppingListDetail({
  list,
  onBack,
}: ShoppingListDetailProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("other");

  const { data: items = [], isLoading } = useShoppingListItems(list.id);
  const updateList = useUpdateShoppingList();
  const addItem = useAddShoppingListItem();
  const updateItem = useUpdateShoppingListItem();
  const toggleItem = useToggleShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const handleSaveTitle = async () => {
    if (!title.trim()) {
      toast.error("Titel krävs");
      return;
    }
    try {
      await updateList.mutateAsync({ id: list.id, updates: { title } });
      setIsEditingTitle(false);
      toast.success("Titel uppdaterad");
    } catch {
      toast.error("Kunde inte uppdatera");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addItem.mutateAsync({
        shopping_list_id: list.id,
        item_name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        category: newItemCategory,
      });
      setNewItemName("");
      setNewItemQuantity("");
    } catch {
      toast.error("Kunde inte lägga till vara");
    }
  };

  const handleToggle = async (item: ShoppingListItem) => {
    try {
      await toggleItem.mutateAsync({
        id: item.id,
        checked: !item.checked,
        listId: list.id,
      });
    } catch {
      toast.error("Kunde inte uppdatera");
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync({ id: itemId, listId: list.id });
    } catch {
      toast.error("Kunde inte ta bort");
    }
  };

  const handleShare = () => {
    const text = items
      .map((item) => `${item.checked ? "☑" : "☐"} ${item.item_name}${item.quantity ? ` (${item.quantity})` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(`${list.title}\n\n${text}`);
    toast.success("Kopierad till urklipp!");
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setTitle(list.title);
                setIsEditingTitle(false);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-bold">{list.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingTitle(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {checkedCount} av {items.length} klara
        </span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: items.length > 0 ? `${(checkedCount / items.length) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      {/* Add item form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          placeholder="Lägg till vara..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Antal"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(e.target.value)}
          className="w-20"
        />
        <Select value={newItemCategory} onValueChange={setNewItemCategory}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      {/* Items grouped by category */}
      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Laddar...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Inga varor ännu. Lägg till din första vara ovan.
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catItems = groupedItems[cat.value];
            if (!catItems || catItems.length === 0) return null;

            return (
              <div key={cat.value}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {cat.label}
                </h3>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg bg-card border transition-all",
                        item.checked && "opacity-60"
                      )}
                    >
                      <Checkbox
                        checked={item.checked || false}
                        onCheckedChange={() => handleToggle(item)}
                      />
                      <span
                        className={cn(
                          "flex-1",
                          item.checked && "line-through text-muted-foreground"
                        )}
                      >
                        {item.item_name}
                      </span>
                      {item.quantity && (
                        <span className="text-sm text-muted-foreground">
                          {item.quantity}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
