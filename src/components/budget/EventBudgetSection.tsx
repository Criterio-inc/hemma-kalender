import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  DollarSign,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEventBudget,
  useBudgetItems,
  useCreateBudget,
  useUpdateBudget,
  useAddBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
  BudgetItem,
} from "@/hooks/useBudgets";
import { toast } from "sonner";

interface EventBudgetSectionProps {
  eventId: string;
  hasBudget: boolean;
}

const categories = [
  { value: "food", label: "Mat & Dryck" },
  { value: "decoration", label: "Dekoration" },
  { value: "gifts", label: "Presenter" },
  { value: "entertainment", label: "Underhållning" },
  { value: "venue", label: "Lokal" },
  { value: "other", label: "Övrigt" },
];

const categoryColors: Record<string, string> = {
  food: "#22c55e",
  decoration: "#ec4899",
  gifts: "#f59e0b",
  entertainment: "#8b5cf6",
  venue: "#3b82f6",
  other: "#6b7280",
};

const EventBudgetSection = ({ eventId, hasBudget }: EventBudgetSectionProps) => {
  const { data: budget, isLoading: budgetLoading } = useEventBudget(eventId);
  const { data: items = [], isLoading: itemsLoading } = useBudgetItems(budget?.id);
  
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const addItem = useAddBudgetItem();
  const updateItem = useUpdateBudgetItem();
  const deleteItem = useDeleteBudgetItem();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [totalBudgetInput, setTotalBudgetInput] = useState("");
  const [isEditingTotal, setIsEditingTotal] = useState(false);

  // Form state for new/editing item
  const [formCategory, setFormCategory] = useState("food");
  const [formDescription, setFormDescription] = useState("");
  const [formEstimated, setFormEstimated] = useState("");
  const [formActual, setFormActual] = useState("");

  if (!hasBudget) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Budget är inte aktiverad för denna händelse</p>
      </div>
    );
  }

  if (budgetLoading || itemsLoading) {
    return <div className="text-center py-4 text-muted-foreground">Laddar budget...</div>;
  }

  // Initialize budget if it doesn't exist
  const handleCreateBudget = async () => {
    try {
      await createBudget.mutateAsync({
        eventId,
        totalBudget: 0,
      });
      toast.success("Budget skapad!");
    } catch (error) {
      toast.error("Kunde inte skapa budget");
    }
  };

  if (!budget) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground mb-4">Ingen budget skapad än</p>
        <Button onClick={handleCreateBudget} disabled={createBudget.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Skapa budget
        </Button>
      </div>
    );
  }

  // Calculate totals
  const totalEstimated = items.reduce((sum, item) => sum + Number(item.estimated_cost), 0);
  const totalActual = items.reduce((sum, item) => sum + Number(item.actual_cost), 0);
  const remaining = Number(budget.total_budget) - totalActual;
  const spentPercentage = budget.total_budget > 0 
    ? Math.min(100, (totalActual / Number(budget.total_budget)) * 100)
    : 0;

  // Group items by category for pie chart
  const categoryTotals = items.reduce((acc, item) => {
    const cat = item.category || "other";
    acc[cat] = (acc[cat] || 0) + Number(item.actual_cost);
    return acc;
  }, {} as Record<string, number>);

  const handleSaveTotalBudget = async () => {
    const value = parseFloat(totalBudgetInput);
    if (isNaN(value) || value < 0) {
      toast.error("Ange ett giltigt belopp");
      return;
    }
    try {
      await updateBudget.mutateAsync({
        id: budget.id,
        updates: { total_budget: value },
      });
      setIsEditingTotal(false);
      toast.success("Budget uppdaterad!");
    } catch (error) {
      toast.error("Kunde inte uppdatera budget");
    }
  };

  const handleAddItem = async () => {
    if (!formDescription.trim()) {
      toast.error("Ange en beskrivning");
      return;
    }
    try {
      await addItem.mutateAsync({
        budgetId: budget.id,
        category: formCategory,
        description: formDescription.trim(),
        estimatedCost: parseFloat(formEstimated) || 0,
        actualCost: parseFloat(formActual) || 0,
      });
      setIsAddingItem(false);
      resetForm();
      toast.success("Budgetpost tillagd!");
    } catch (error) {
      toast.error("Kunde inte lägga till post");
    }
  };

  const handleUpdateItem = async (item: BudgetItem) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        budgetId: budget.id,
        updates: {
          category: formCategory,
          description: formDescription.trim(),
          estimated_cost: parseFloat(formEstimated) || 0,
          actual_cost: parseFloat(formActual) || 0,
        },
      });
      setEditingItemId(null);
      resetForm();
      toast.success("Post uppdaterad!");
    } catch (error) {
      toast.error("Kunde inte uppdatera post");
    }
  };

  const handleTogglePaid = async (item: BudgetItem) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        budgetId: budget.id,
        updates: { paid: !item.paid },
      });
    } catch (error) {
      toast.error("Kunde inte uppdatera betalstatus");
    }
  };

  const handleDeleteItem = async (item: BudgetItem) => {
    try {
      await deleteItem.mutateAsync({ id: item.id, budgetId: budget.id });
      toast.success("Post borttagen!");
    } catch (error) {
      toast.error("Kunde inte ta bort post");
    }
  };

  const resetForm = () => {
    setFormCategory("food");
    setFormDescription("");
    setFormEstimated("");
    setFormActual("");
  };

  const startEditing = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setFormCategory(item.category || "other");
    setFormDescription(item.description || "");
    setFormEstimated(String(item.estimated_cost));
    setFormActual(String(item.actual_cost));
  };

  return (
    <div className="space-y-6">
      {/* Total Budget Section */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">Total budget</h4>
          {!isEditingTotal ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {Number(budget.total_budget).toLocaleString("sv-SE")} {budget.currency}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTotalBudgetInput(String(budget.total_budget));
                  setIsEditingTotal(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(e.target.value)}
                className="w-32"
                placeholder="0"
              />
              <span className="text-muted-foreground">{budget.currency}</span>
              <Button size="icon" variant="ghost" onClick={handleSaveTotalBudget}>
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditingTotal(false)}>
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spenderat</span>
            <span className={remaining < 0 ? "text-destructive font-medium" : "text-foreground"}>
              {totalActual.toLocaleString("sv-SE")} / {Number(budget.total_budget).toLocaleString("sv-SE")} {budget.currency}
            </span>
          </div>
          <Progress 
            value={spentPercentage} 
            className={remaining < 0 ? "[&>div]:bg-destructive" : ""} 
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Kvar</span>
            <span className={remaining < 0 ? "text-destructive font-medium" : "text-green-600 font-medium"}>
              {remaining.toLocaleString("sv-SE")} {budget.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {items.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Fördelning per kategori
          </h4>
          <div className="space-y-2">
            {Object.entries(categoryTotals)
              .filter(([_, total]) => total > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => {
                const percentage = totalActual > 0 ? (total / totalActual) * 100 : 0;
                const categoryLabel = categories.find((c) => c.value === cat)?.label || "Övrigt";
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[cat] || categoryColors.other }}
                    />
                    <span className="flex-1 text-sm">{categoryLabel}</span>
                    <span className="text-sm text-muted-foreground">
                      {total.toLocaleString("sv-SE")} {budget.currency}
                    </span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Budget Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Budgetposter</h4>
          {!isAddingItem && (
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setIsAddingItem(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Lägg till
            </Button>
          )}
        </div>

        {/* Add item form */}
        {isAddingItem && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kategori</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
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
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Beskrivning</Label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="T.ex. Julskinka"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Uppskattat ({budget.currency})</Label>
                <Input
                  type="number"
                  value={formEstimated}
                  onChange={(e) => setFormEstimated(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Faktiskt ({budget.currency})</Label>
                <Input
                  type="number"
                  value={formActual}
                  onChange={(e) => setFormActual(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAddingItem(false)}>
                Avbryt
              </Button>
              <Button size="sm" onClick={handleAddItem} disabled={addItem.isPending}>
                Spara
              </Button>
            </div>
          </div>
        )}

        {/* Items list */}
        {items.length === 0 && !isAddingItem ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Inga budgetposter än
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border rounded-lg p-3"
              >
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Kategori</Label>
                        <Select value={formCategory} onValueChange={setFormCategory}>
                          <SelectTrigger>
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
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Beskrivning</Label>
                        <Input
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Uppskattat</Label>
                        <Input
                          type="number"
                          value={formEstimated}
                          onChange={(e) => setFormEstimated(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Faktiskt</Label>
                        <Input
                          type="number"
                          value={formActual}
                          onChange={(e) => setFormActual(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingItemId(null)}>
                        Avbryt
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateItem(item)}>
                        Spara
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.paid}
                      onCheckedChange={() => handleTogglePaid(item)}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: categoryColors[item.category || "other"] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.paid ? "line-through text-muted-foreground" : ""}`}>
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {categories.find((c) => c.value === item.category)?.label || "Övrigt"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground line-through text-xs">
                        {Number(item.estimated_cost).toLocaleString("sv-SE")}
                      </p>
                      <p className="font-medium">
                        {Number(item.actual_cost).toLocaleString("sv-SE")} {budget.currency}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEditing(item)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-xl p-4">
        <h4 className="font-semibold mb-3">Sammanfattning</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Uppskattat</p>
            <p className="font-semibold">{totalEstimated.toLocaleString("sv-SE")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Faktiskt</p>
            <p className="font-semibold">{totalActual.toLocaleString("sv-SE")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Kvar</p>
            <p className={`font-semibold ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
              {remaining.toLocaleString("sv-SE")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBudgetSection;
