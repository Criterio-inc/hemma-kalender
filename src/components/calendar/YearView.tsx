import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  setMonth,
} from "date-fns";
import { sv } from "date-fns/locale";
import { Event } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";

interface YearViewProps {
  year: number;
  events: Event[];
  onMonthClick: (month: number) => void;
  onDayClick: (date: Date) => void;
}

const categoryColors: Record<string, string> = {
  birthday: "#ec4899",
  christmas: "#ef4444",
  wedding: "#a855f7",
  easter: "#eab308",
  midsummer: "#22c55e",
  new_year: "#3b82f6",
  graduation: "#6366f1",
  anniversary: "#f43f5e",
  custom: "#3b82f6",
};

const MiniMonth = ({
  month,
  year,
  events,
  onMonthClick,
  onDayClick,
}: {
  month: number;
  year: number;
  events: Event[];
  onMonthClick: () => void;
  onDayClick: (date: Date) => void;
}) => {
  const monthDate = new Date(year, month, 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  // Generate calendar days
  const days: Date[] = [];
  let day = calendarStart;
  while (days.length < 42) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Map events to dates
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((event) => {
      const eventDate = parseISO(event.start_date);
      const key = format(eventDate, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Only show weeks that contain days from this month
  const relevantWeeks = weeks.filter((week) =>
    week.some((d) => isSameMonth(d, monthDate))
  );

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Month header */}
      <button
        onClick={onMonthClick}
        className="w-full p-2 text-center font-semibold text-sm hover:bg-muted/50 transition-colors border-b capitalize"
      >
        {format(monthDate, "MMMM", { locale: sv })}
      </button>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center border-b bg-muted/30">
        {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
          <div
            key={i}
            className="text-[10px] text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="p-1">
        {relevantWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((d, dayIndex) => {
              const key = format(d, "yyyy-MM-dd");
              const dayEvents = eventsByDate[key] || [];
              const hasEvents = dayEvents.length > 0;
              const isCurrentMonth = isSameMonth(d, monthDate);
              const isTodayDate = isToday(d);

              return (
                <button
                  key={dayIndex}
                  onClick={() => isCurrentMonth && onDayClick(d)}
                  disabled={!isCurrentMonth}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center text-xs relative",
                    !isCurrentMonth && "text-muted-foreground/30",
                    isCurrentMonth &&
                      "hover:bg-muted/50 transition-colors rounded",
                    isTodayDate &&
                      isCurrentMonth &&
                      "bg-primary text-primary-foreground rounded-full font-bold"
                  )}
                >
                  {format(d, "d")}
                  {/* Event indicators */}
                  {hasEvents && isCurrentMonth && !isTodayDate && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{
                            backgroundColor:
                              event.color ||
                              categoryColors[event.event_category || "custom"],
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const YearView = ({ year, events, onMonthClick, onDayClick }: YearViewProps) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  // Filter events by month
  const eventsByMonth = useMemo(() => {
    const byMonth: Record<number, Event[]> = {};
    months.forEach((m) => {
      byMonth[m] = [];
    });

    events.forEach((event) => {
      const eventDate = parseISO(event.start_date);
      const month = eventDate.getMonth();
      if (byMonth[month]) {
        byMonth[month].push(event);
      }
    });

    return byMonth;
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Year header */}
      <div className="text-center">
        <p className="text-4xl font-bold">{year}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {events.length} händelser
        </p>
      </div>

      {/* Months grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {months.map((month) => (
          <MiniMonth
            key={month}
            month={month}
            year={year}
            events={eventsByMonth[month]}
            onMonthClick={() => onMonthClick(month)}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
};

export default YearView;
