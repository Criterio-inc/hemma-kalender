import { useState, useMemo } from "react";
import { ListTodo, Plus, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Todo } from "@/hooks/useTodos";
import TodoItem from "./TodoItem";
import { cn } from "@/lib/utils";

interface TodoListProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onAdd: () => void;
  showFilters?: boolean;
  showEventLink?: boolean;
  emptyMessage?: string;
}

type FilterStatus = "all" | "active" | "completed";
type SortBy = "due_date" | "priority" | "created_at";

const priorityOrder = { high: 0, medium: 1, low: 2 };

const TodoList = ({
  todos,
  onEdit,
  onAdd,
  showFilters = true,
  showEventLink = true,
  emptyMessage = "Inga uppgifter än",
}: TodoListProps) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("due_date");

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    // Filter by status
    if (filterStatus === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filterStatus === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Filter by priority
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((t) => t.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "priority":
          const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
          const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
          return aOrder - bOrder;
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [todos, filterStatus, filterPriority, filterCategory, sortBy]);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {activeTodos.length} aktiva, {completedTodos.length} klara
          </span>
        </div>
        <Button variant="hero" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Lägg till
        </Button>
      </div>

      {/* Filters */}
      {showFilters && todos.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="active">Aktiva</SelectItem>
              <SelectItem value="completed">Klara</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Prioritet" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Alla prioriteter</SelectItem>
              <SelectItem value="high">Hög</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Låg</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Alla kategorier</SelectItem>
              <SelectItem value="general">Allmänt</SelectItem>
              <SelectItem value="shopping">Inköp</SelectItem>
              <SelectItem value="cooking">Matlagning</SelectItem>
              <SelectItem value="decoration">Dekoration</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SortAsc className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="due_date">Förfallodatum</SelectItem>
              <SelectItem value="priority">Prioritet</SelectItem>
              <SelectItem value="created_at">Senast skapad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Todo items */}
      {filteredAndSortedTodos.length === 0 ? (
        <div className="text-center py-12">
          <ListTodo className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">{emptyMessage}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Lägg till uppgift
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              showEventLink={showEventLink}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
