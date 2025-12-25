import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, logout, HouseholdSession } from "@/lib/auth";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { sv } from "date-fns/locale";
import {
  useEvents,
  useEventsForDate,
  useEventsForWeek,
  useEventsForYear,
  Event,
} from "@/hooks/useEvents";
import MonthGrid from "@/components/calendar/MonthGrid";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import YearView from "@/components/calendar/YearView";
import CalendarViewSwitcher, {
  CalendarView,
} from "@/components/calendar/CalendarViewSwitcher";
import DayDetailModal from "@/components/calendar/DayDetailModal";
import AddEventModal from "@/components/calendar/AddEventModal";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import TodayTodosWidget from "@/components/todos/TodayTodosWidget";

const Calendar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventDate, setAddEventDate] = useState<Date>(new Date());
  const [addEventHour, setAddEventHour] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  // Fetch events based on current view
  const {
    data: monthEvents = [],
    isLoading: monthLoading,
    error: monthError,
  } = useEvents(session?.householdCode || "", currentDate);

  const { data: weekEvents = [], isLoading: weekLoading } = useEventsForWeek(
    session?.householdCode || "",
    currentDate
  );

  const { data: dayEvents = [], isLoading: dayLoading } = useEventsForDate(
    session?.householdCode || "",
    currentDate
  );

  const { data: yearEvents = [], isLoading: yearLoading } = useEventsForYear(
    session?.householdCode || "",
    currentDate.getFullYear()
  );

  const { data: selectedDateEvents = [] } = useEventsForDate(
    session?.householdCode || "",
    selectedDate || new Date()
  );

  // Navigation functions
  const navigatePrevious = () => {
    switch (currentView) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (currentView) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get appropriate title based on view
  const getViewTitle = () => {
    switch (currentView) {
      case "day":
        return format(currentDate, "EEEE d MMMM yyyy", { locale: sv });
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, "d MMM", { locale: sv })} - ${format(
          weekEnd,
          "d MMM yyyy",
          { locale: sv }
        )}`;
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: sv });
      case "year":
        return currentDate.getFullYear().toString();
    }
  };

  // Get "go to today" button text based on view
  const getTodayButtonText = () => {
    switch (currentView) {
      case "day":
        return "Idag";
      case "week":
        return "Denna vecka";
      case "month":
        return "Denna månad";
      case "year":
        return "Detta år";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (selectedDate) {
      setAddEventDate(selectedDate);
    } else {
      setAddEventDate(new Date());
    }
    setAddEventHour(null);
    setSelectedDate(null);
    setIsAddEventOpen(true);
  };

  const handleAddEventFromHeader = () => {
    setAddEventDate(new Date());
    setAddEventHour(null);
    setIsAddEventOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setAddEventDate(date);
    setAddEventHour(hour);
    setIsAddEventOpen(true);
  };

  const handleDayViewTimeSlotClick = (hour: number) => {
    setAddEventDate(currentDate);
    setAddEventHour(hour);
    setIsAddEventOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedDate(null);
    setSelectedEvent(event);
  };

  const handleMonthClick = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setCurrentView("month");
  };

  const handleYearDayClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView("day");
  };

  // Loading and error states
  const isLoading =
    (currentView === "month" && monthLoading) ||
    (currentView === "week" && weekLoading) ||
    (currentView === "day" && dayLoading) ||
    (currentView === "year" && yearLoading);

  const error = currentView === "month" && monthError;

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
                variant="ghost"
                size="icon"
                onClick={() => navigate("/todos")}
              >
                <ListTodo className="w-5 h-5" />
              </Button>
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
        {/* View Switcher */}
        <div className="flex justify-center mb-4">
          <CalendarViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-display font-bold capitalize text-foreground">
              {getViewTitle()}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-primary font-medium hover:underline mt-1"
            >
              {getTodayButtonText()}
            </button>
          </div>

          <Button variant="ghost" size="icon" onClick={navigateNext}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Views */}
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
          <>
            {currentView === "month" && (
              <MonthGrid
                currentDate={currentDate}
                events={monthEvents}
                onDayClick={handleDayClick}
              />
            )}

            {currentView === "week" && (
              <WeekView
                currentDate={currentDate}
                events={weekEvents}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleEventClick}
              />
            )}

            {currentView === "day" && (
              <DayView
                currentDate={currentDate}
                events={dayEvents}
                onTimeSlotClick={handleDayViewTimeSlotClick}
                onEventClick={handleEventClick}
              />
            )}

            {currentView === "year" && (
              <YearView
                year={currentDate.getFullYear()}
                events={yearEvents}
                onMonthClick={handleMonthClick}
                onDayClick={handleYearDayClick}
              />
            )}
          </>
        )}

        {/* Today's Todos Widget - only show in day/month view */}
        {(currentView === "day" || currentView === "month") && (
          <div className="mt-6">
            <TodayTodosWidget householdCode={session.householdCode} />
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          {currentView === "month" && (
            <span>
              <strong className="text-foreground">{monthEvents.length}</strong>{" "}
              händelser denna månad
            </span>
          )}
          {currentView === "week" && (
            <span>
              <strong className="text-foreground">{weekEvents.length}</strong>{" "}
              händelser denna vecka
            </span>
          )}
          {currentView === "day" && (
            <span>
              <strong className="text-foreground">{dayEvents.length}</strong>{" "}
              händelser idag
            </span>
          )}
          {currentView === "year" && (
            <span>
              <strong className="text-foreground">{yearEvents.length}</strong>{" "}
              händelser detta år
            </span>
          )}
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
        onClose={() => {
          setIsAddEventOpen(false);
          setAddEventHour(null);
        }}
        selectedDate={addEventDate}
        householdCode={session.householdCode}
      />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
