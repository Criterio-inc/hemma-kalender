import { useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { sv } from "date-fns/locale";
import { CheckCircle2, Clock, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo, useTodosForToday, useToggleTodo } from "@/hooks/useTodos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TodoForm from "./TodoForm";
import { useNavigate } from "react-router-dom";

interface TodayTodosWidgetProps {
  householdCode: string;
}

const TodayTodosWidget = ({ householdCode }: TodayTodosWidgetProps) => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: todos = [], isLoading } = useTodosForToday(householdCode);
  const toggleTodo = useToggleTodo();

  const overdueTodos = todos.filter(
    (t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
  );
  const todayTodos = todos.filter(
    (t) => t.due_date && isToday(new Date(t.due_date))
  );

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTodo.mutateAsync({ id: todo.id, completed: !todo.completed });
      toast.success("Klart!");
    } catch (error) {
      toast.error("Kunde inte uppdatera");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const allTodos = [...overdueTodos, ...todayTodos];
  const displayTodos = allTodos.slice(0, 5);
  const hasMore = allTodos.length > 5;

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Att göra idag</h3>
              {allTodos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {allTodos.length} uppgift{allTodos.length !== 1 ? "er" : ""}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        {allTodos.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 mx-auto text-success/40 mb-2" />
            <p className="text-sm text-muted-foreground">Allt klart för idag!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Overdue section */}
            {overdueTodos.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs text-destructive font-medium mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  Försenade
                </div>
                {overdueTodos.slice(0, 2).map((todo) => (
                  <TodoMiniItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => handleToggle(todo)}
                    isOverdue
                  />
                ))}
              </div>
            )}

            {/* Today's todos */}
            {todayTodos.length > 0 && (
              <div>
                {overdueTodos.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mb-2">
                    <Clock className="w-3 h-3" />
                    Idag
                  </div>
                )}
                {todayTodos.slice(0, 3).map((todo) => (
                  <TodoMiniItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => handleToggle(todo)}
                  />
                ))}
              </div>
            )}

            {/* View all button */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-primary"
                onClick={() => navigate("/todos")}
              >
                Visa alla
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Quick add button */}
        {allTodos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till uppgift
          </Button>
        )}
      </div>

      {/* Todo form modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        householdCode={householdCode}
      />
    </>
  );
};

// Mini todo item for widget
const TodoMiniItem = ({
  todo,
  onToggle,
  isOverdue,
}: {
  todo: Todo;
  onToggle: () => void;
  isOverdue?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center gap-2 p-2 rounded-lg transition-colors",
      "hover:bg-muted/50",
      isOverdue && "bg-destructive/5"
    )}
  >
    <Checkbox
      checked={todo.completed || false}
      onCheckedChange={onToggle}
      className={cn(
        "h-4 w-4 rounded-full",
        "data-[state=checked]:bg-success data-[state=checked]:border-success"
      )}
    />
    <span
      className={cn(
        "flex-1 text-sm truncate",
        todo.completed && "line-through text-muted-foreground"
      )}
    >
      {todo.title}
    </span>
  </div>
);

export default TodayTodosWidget;
