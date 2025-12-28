import { useNavigate } from "react-router-dom";
import { Calendar, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseholdSession, logout } from "@/lib/auth";
import { useSeasonalTheme, getSeasonName } from "@/contexts/SeasonalThemeContext";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAllEvents } from "@/hooks/useEvents";
import { useRecipes } from "@/hooks/useRecipes";
import { useTodos } from "@/hooks/useTodos";
import { useNotes } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  session: HouseholdSession;
  onAddEvent?: () => void;
}

const AppHeader = ({ session, onAddEvent }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { month } = useSeasonalTheme();

  // Fetch data for global search
  const { data: events = [] } = useAllEvents(session.householdCode);
  const { data: recipes = [] } = useRecipes(session.householdCode);
  const { data: todos = [] } = useTodos(session.householdCode);
  const { data: notes = [] } = useNotes(session.householdCode, undefined);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and app name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/calendar")}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                  Familjekalendern
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.householdName} • {getSeasonName(month)}
                </p>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Global Search */}
            <GlobalSearch
              householdCode={session.householdCode}
              events={events}
              recipes={recipes}
              todos={todos}
              notes={notes}
            />

            {/* Notifications */}
            <NotificationBell householdCode={session.householdCode} />

            {/* Add Event */}
            {onAddEvent && (
              <Button
                variant="hero"
                size="sm"
                onClick={onAddEvent}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ny händelse</span>
              </Button>
            )}

            {/* Logout */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
