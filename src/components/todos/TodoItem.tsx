import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import { sv } from "date-fns/locale";
import { Trash2, Edit2, Calendar, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo, useToggleTodo, useDeleteTodo } from "@/hooks/useTodos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  showEventLink?: boolean;
}

const priorityConfig = {
  high: { label: "Hög", color: "bg-destructive", dotColor: "bg-destructive" },
  medium: { label: "Medium", color: "bg-warning", dotColor: "bg-warning" },
  low: { label: "Låg", color: "bg-muted", dotColor: "bg-muted-foreground" },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  shopping: { label: "Inköp", color: "bg-primary/20 text-primary" },
  cooking: { label: "Matlagning", color: "bg-accent/20 text-accent" },
  decoration: { label: "Dekoration", color: "bg-success/20 text-success" },
  general: { label: "Allmänt", color: "bg-muted text-muted-foreground" },
};

const TodoItem = ({ todo, onEdit, showEventLink = true }: TodoItemProps) => {
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggle = async () => {
    try {
      await toggleTodo.mutateAsync({ id: todo.id, completed: !todo.completed });
      toast.success(todo.completed ? "Markerad som ogjord" : "Markerad som klar!");
    } catch (error) {
      toast.error("Kunde inte uppdatera uppgiften");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo.mutateAsync(todo.id);
      toast.success("Uppgift borttagen");
    } catch (error) {
      toast.error("Kunde inte ta bort uppgiften");
    }
  };

  const getDueDateInfo = () => {
    if (!todo.due_date) return null;
    
    const dueDate = new Date(todo.due_date);
    const now = new Date();
    
    if (todo.completed) {
      return { text: format(dueDate, "d MMM", { locale: sv }), className: "text-muted-foreground" };
    }
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      const days = differenceInDays(now, dueDate);
      return { text: `${days} dagar sen`, className: "text-destructive font-medium" };
    }
    
    if (isToday(dueDate)) {
      return { text: "Idag", className: "text-warning font-medium" };
    }
    
    if (isTomorrow(dueDate)) {
      return { text: "Imorgon", className: "text-primary font-medium" };
    }
    
    const days = differenceInDays(dueDate, now);
    if (days <= 3) {
      return { text: format(dueDate, "EEEE", { locale: sv }), className: "text-warning" };
    }
    
    return { text: format(dueDate, "d MMM", { locale: sv }), className: "text-muted-foreground" };
  };

  const dueDateInfo = getDueDateInfo();
  const priority = priorityConfig[todo.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const category = categoryConfig[todo.category || "general"] || categoryConfig.general;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-xl bg-card border border-border",
        "transition-all duration-200 hover:shadow-md hover:border-primary/20",
        todo.completed && "opacity-60 bg-muted/50"
      )}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={todo.completed || false}
          onCheckedChange={handleToggle}
          disabled={toggleTodo.isPending}
          className={cn(
            "h-5 w-5 rounded-full transition-all",
            "data-[state=checked]:bg-success data-[state=checked]:border-success"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "font-medium text-foreground truncate",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </h4>
            {todo.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}
          </div>

          {/* Priority dot */}
          <div
            className={cn("w-2 h-2 rounded-full shrink-0 mt-2", priority.dotColor)}
            title={priority.label}
          />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Category badge */}
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", category.color)}>
            {category.label}
          </span>

          {/* Due date */}
          {dueDateInfo && (
            <span className={cn("flex items-center gap-1 text-xs", dueDateInfo.className)}>
              <Calendar className="w-3 h-3" />
              {dueDateInfo.text}
            </span>
          )}

          {/* Event link indicator */}
          {showEventLink && todo.event_id && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Link2 className="w-3 h-3" />
              Kopplad
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(todo)}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteTodo.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TodoItem;
