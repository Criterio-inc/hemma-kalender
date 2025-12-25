import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, LogOut, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, logout, HouseholdSession } from "@/lib/auth";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay } from "date-fns";
import { sv } from "date-fns/locale";

const Calendar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  // Adjust for Swedish calendar (week starts on Monday)
  const startDayOfWeek = getDay(monthStart);
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weekDays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">
                {session.householdName}
              </h1>
              <p className="text-xs text-muted-foreground">
                {session.householdCode}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: sv })}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-primary font-medium hover:underline"
            >
              Gå till idag
            </button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-muted/50">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`py-3 text-center text-sm font-semibold ${
                  index >= 5 ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: adjustedStartDay }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-[80px] md:min-h-[100px] p-2 border-t border-r border-border bg-muted/20"
              />
            ))}
            
            {/* Actual days */}
            {days.map((day, index) => {
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isTodayDate = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] md:min-h-[100px] p-2 border-t border-r border-border transition-colors hover:bg-primary/5 cursor-pointer ${
                    !isCurrentMonth ? "bg-muted/30" : ""
                  } ${isWeekend ? "bg-accent/5" : ""}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                      isTodayDate
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isWeekend
                        ? "text-accent"
                        : "text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              );
            })}
            
            {/* Empty cells to complete the grid */}
            {Array.from({
              length: (7 - ((adjustedStartDay + days.length) % 7)) % 7,
            }).map((_, index) => (
              <div
                key={`empty-end-${index}`}
                className="min-h-[80px] md:min-h-[100px] p-2 border-t border-r border-border bg-muted/20"
              />
            ))}
          </div>
        </div>

        {/* Empty State / Placeholder */}
        <div className="mt-8 text-center py-12 bg-card rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-display font-bold text-foreground mb-2">
            Inga händelser än
          </h3>
          <p className="text-muted-foreground mb-4">
            Lägg till familjens aktiviteter och håll koll på alla tillsammans
          </p>
          <Button variant="hero">
            <Plus className="w-4 h-4" />
            Lägg till händelse
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
