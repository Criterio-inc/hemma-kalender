import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListTodo, ChevronLeft, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, HouseholdSession } from "@/lib/auth";
import { useTodos, Todo } from "@/hooks/useTodos";
import TodoList from "@/components/todos/TodoList";
import TodoForm from "@/components/todos/TodoForm";

const Todos = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const { data: todos = [], isLoading, error } = useTodos(session?.householdCode || "");

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/calendar")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <ListTodo className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-foreground">
                  Att göra
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.householdName}
                </p>
              </div>
            </div>

            <Button variant="hero" size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ny uppgift</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive font-medium">
              Kunde inte hämta uppgifter
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Försök igen
            </Button>
          </div>
        ) : (
          <TodoList
            todos={todos}
            onEdit={handleEdit}
            onAdd={handleAdd}
            showFilters={true}
            showEventLink={true}
            emptyMessage="Inga uppgifter än. Lägg till din första uppgift!"
          />
        )}
      </main>

      {/* Todo form modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleClose}
        householdCode={session.householdCode}
        todo={editingTodo}
      />
    </div>
  );
};

export default Todos;
