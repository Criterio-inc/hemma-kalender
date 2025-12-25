import { useState, useMemo } from "react";
import { ListTodo, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Todo, useTodosForEvent } from "@/hooks/useTodos";
import { useTimelinePhases, TimelinePhase } from "@/hooks/useTimeline";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EventTodoListProps {
  eventId: string;
  householdCode: string;
  hasTimeline?: boolean;
}

const EventTodoList = ({ eventId, householdCode, hasTimeline }: EventTodoListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(["unassigned"]));

  const { data: todos = [], isLoading } = useTodosForEvent(eventId);
  const { data: phases = [] } = useTimelinePhases(hasTimeline ? eventId : "");

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  // Group todos by phase
  const groupedTodos = useMemo(() => {
    if (!hasTimeline || phases.length === 0) {
      return { ungrouped: todos };
    }

    const groups: Record<string, Todo[]> = {
      unassigned: [],
    };

    phases.forEach((phase) => {
      groups[phase.id] = [];
    });

    todos.forEach((todo) => {
      if (todo.timeline_phase_id && groups[todo.timeline_phase_id]) {
        groups[todo.timeline_phase_id].push(todo);
      } else {
        groups.unassigned.push(todo);
      }
    });

    return groups;
  }, [todos, phases, hasTimeline]);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Att göra</h4>
          <span className="text-sm text-muted-foreground">
            ({activeTodos.length} aktiva, {completedTodos.length} klara)
          </span>
        </div>
        <Button variant="hero" size="sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Lägg till
        </Button>
      </div>

      {/* Content */}
      {todos.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <ListTodo className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Inga uppgifter för denna händelse</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till uppgift
          </Button>
        </div>
      ) : hasTimeline && phases.length > 0 ? (
        // Grouped by timeline phases
        <div className="space-y-3">
          {phases.map((phase) => {
            const phaseTodos = groupedTodos[phase.id] || [];
            const isExpanded = expandedPhases.has(phase.id);

            return (
              <PhaseGroup
                key={phase.id}
                phase={phase}
                todos={phaseTodos}
                isExpanded={isExpanded}
                onToggle={() => togglePhase(phase.id)}
                onEdit={handleEdit}
              />
            );
          })}

          {/* Unassigned todos */}
          {groupedTodos.unassigned && groupedTodos.unassigned.length > 0 && (
            <Collapsible
              open={expandedPhases.has("unassigned")}
              onOpenChange={() => togglePhase("unassigned")}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between py-2 h-auto"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">Ej tilldelade</span>
                    <span className="text-xs text-muted-foreground">
                      ({groupedTodos.unassigned.length})
                    </span>
                  </span>
                  {expandedPhases.has("unassigned") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {groupedTodos.unassigned.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onEdit={handleEdit}
                    showEventLink={false}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ) : (
        // Flat list
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={handleEdit}
              showEventLink={false}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleClose}
        householdCode={householdCode}
        todo={editingTodo}
        defaultEventId={eventId}
      />
    </div>
  );
};

// Phase group component
const PhaseGroup = ({
  phase,
  todos,
  isExpanded,
  onToggle,
  onEdit,
}: {
  phase: TimelinePhase;
  todos: Todo[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (todo: Todo) => void;
}) => {
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between py-3 h-auto bg-muted/30 hover:bg-muted/50"
        >
          <span className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-medium">{phase.phase_name}</span>
            <span className="text-xs text-muted-foreground">
              ({completedCount}/{todos.length} klara)
            </span>
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2 ml-5">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Inga uppgifter i denna fas
          </p>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              showEventLink={false}
            />
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EventTodoList;
