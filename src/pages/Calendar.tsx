import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, logout, HouseholdSession } from "@/lib/auth";
import { format, addMonths, subMonths } from "date-fns";
import { sv } from "date-fns/locale";
import { useEvents, useEventsForDate, Event } from "@/hooks/useEvents";
import MonthGrid from "@/components/calendar/MonthGrid";
import DayDetailModal from "@/components/calendar/DayDetailModal";
import AddEventModal from "@/components/calendar/AddEventModal";

const Calendar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventDate, setAddEventDate] = useState<Date>(new Date());

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const {
    data: events = [],
    isLoading,
    error,
  } = useEvents(session?.householdCode || "", currentDate);

  const { data: selectedDateEvents = [] } = useEventsForDate(
    session?.householdCode || "",
    selectedDate || new Date()
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (selectedDate) {
      setAddEventDate(selectedDate);
    } else {
      setAddEventDate(new Date());
    }
    setSelectedDate(null);
    setIsAddEventOpen(true);
  };

  const handleAddEventFromHeader = () => {
    setAddEventDate(new Date());
    setIsAddEventOpen(true);
  };

  const handleEventClick = (event: Event) => {
    // For now, just close the modal. Later we can add event detail view
    console.log("Event clicked:", event);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and household info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <CalendarIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                  {session.householdName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.householdCode}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="hero"
                size="sm"
                onClick={handleAddEventFromHeader}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ny händelse</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold capitalize text-foreground">
              {format(currentDate, "MMMM yyyy", { locale: sv })}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-primary font-medium hover:underline mt-1"
            >
              Gå till idag
            </button>
          </div>

          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive font-medium">
              Kunde inte hämta händelser
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
          <MonthGrid
            currentDate={currentDate}
            events={events}
            onDayClick={handleDayClick}
          />
        )}

        {/* Stats */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{events.length}</strong> händelser denna månad
          </span>
        </div>
      </main>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          events={selectedDateEvents}
          onAddEvent={handleAddEvent}
          onEventClick={handleEventClick}
        />
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        selectedDate={addEventDate}
        householdCode={session.householdCode}
      />
    </div>
  );
};

export default Calendar;
