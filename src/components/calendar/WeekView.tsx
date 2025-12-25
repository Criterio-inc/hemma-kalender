import { useMemo, useRef, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  parseISO,
  getHours,
  getMinutes,
  differenceInMinutes,
} from "date-fns";
import { sv } from "date-fns/locale";
import { Event } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: Event) => void;
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

const HOUR_HEIGHT = 60;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeekView = ({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: WeekViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      const scrollTop = Math.max(0, (currentHour - 2) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Organize events by day
  const eventsByDay = useMemo(() => {
    const byDay: Record<string, { allDay: Event[]; timed: Event[] }> = {};

    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      byDay[key] = { allDay: [], timed: [] };
    });

    events.forEach((event) => {
      const eventDate = parseISO(event.start_date);
      const key = format(eventDate, "yyyy-MM-dd");

      if (byDay[key]) {
        if (event.all_day) {
          byDay[key].allDay.push(event);
        } else {
          byDay[key].timed.push(event);
        }
      }
    });

    return byDay;
  }, [events, days]);

  const getEventPosition = (event: Event) => {
    const start = parseISO(event.start_date);
    const startHour = getHours(start);
    const startMinute = getMinutes(start);
    const top = startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;

    let height = HOUR_HEIGHT; // Default 1 hour
    if (event.end_date) {
      const end = parseISO(event.end_date);
      const duration = differenceInMinutes(end, start);
      height = Math.max(30, (duration / 60) * HOUR_HEIGHT);
    }

    return { top, height };
  };

  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const hour = getHours(now);
    const minute = getMinutes(now);
    return hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
  }, []);

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30">
        <div className="p-2 border-r" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "p-2 text-center border-r last:border-r-0",
              isToday(day) && "bg-primary/10"
            )}
          >
            <p className="text-xs text-muted-foreground uppercase">
              {format(day, "EEE", { locale: sv })}
            </p>
            <p
              className={cn(
                "text-lg font-semibold",
                isToday(day) && "text-primary"
              )}
            >
              {format(day, "d")}
            </p>
          </div>
        ))}
      </div>

      {/* All-day events section */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b min-h-[40px]">
        <div className="p-1 border-r text-xs text-muted-foreground flex items-center justify-center">
          Heldag
        </div>
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[key]?.allDay || [];

          return (
            <div
              key={key}
              className="p-1 border-r last:border-r-0 space-y-0.5"
            >
              {dayEvents.slice(0, 3).map((event) => {
                const eventColor =
                  event.color || categoryColors[event.event_category || "custom"];
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left px-1.5 py-0.5 rounded text-xs truncate text-white font-medium"
                    style={{ backgroundColor: eventColor }}
                  >
                    {event.event_type === "major_event" && (
                      <Sparkles className="w-3 h-3 inline mr-0.5" />
                    )}
                    {event.title}
                  </button>
                );
              })}
              {dayEvents.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{dayEvents.length - 3} mer
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {/* Hour labels */}
          <div className="border-r">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b text-xs text-muted-foreground text-right pr-2 flex items-start justify-end"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="-mt-2">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay[key]?.timed || [];

            return (
              <div
                key={key}
                className={cn(
                  "border-r last:border-r-0 relative",
                  isToday(day) && "bg-primary/5"
                )}
              >
                {/* Hour slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => onTimeSlotClick(day, hour)}
                  />
                ))}

                {/* Timed events */}
                {dayEvents.map((event, eventIndex) => {
                  const { top, height } = getEventPosition(event);
                  const eventColor =
                    event.color ||
                    categoryColors[event.event_category || "custom"];

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="absolute left-0.5 right-0.5 px-1.5 py-0.5 rounded text-xs text-white font-medium overflow-hidden text-left"
                      style={{
                        top,
                        height,
                        backgroundColor: eventColor,
                        zIndex: 10 + eventIndex,
                      }}
                    >
                      <span className="block truncate">
                        {event.event_type === "major_event" && (
                          <Sparkles className="w-3 h-3 inline mr-0.5" />
                        )}
                        {event.title}
                      </span>
                      <span className="block text-[10px] opacity-80">
                        {format(parseISO(event.start_date), "HH:mm")}
                      </span>
                    </button>
                  );
                })}

                {/* Current time indicator */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-destructive z-20"
                    style={{ top: currentTimePosition }}
                  >
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-destructive" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
