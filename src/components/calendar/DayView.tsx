import { useMemo, useRef, useEffect } from "react";
import {
  format,
  isToday,
  parseISO,
  getHours,
  getMinutes,
  differenceInMinutes,
} from "date-fns";
import { sv } from "date-fns/locale";
import { Event } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, MapPin } from "lucide-react";

interface DayViewProps {
  currentDate: Date;
  events: Event[];
  onTimeSlotClick: (hour: number) => void;
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

const HOUR_HEIGHT = 80;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayView = ({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: DayViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      const scrollTop = Math.max(0, (currentHour - 2) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Separate all-day and timed events
  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDay: Event[] = [];
    const timed: Event[] = [];

    events.forEach((event) => {
      if (event.all_day) {
        allDay.push(event);
      } else {
        timed.push(event);
      }
    });

    return { allDayEvents: allDay, timedEvents: timed };
  }, [events]);

  const getEventPosition = (event: Event) => {
    const start = parseISO(event.start_date);
    const startHour = getHours(start);
    const startMinute = getMinutes(start);
    const top = startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;

    let height = HOUR_HEIGHT; // Default 1 hour
    if (event.end_date) {
      const end = parseISO(event.end_date);
      const duration = differenceInMinutes(end, start);
      height = Math.max(40, (duration / 60) * HOUR_HEIGHT);
    }

    return { top, height };
  };

  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const hour = getHours(now);
    const minute = getMinutes(now);
    return hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
  }, []);

  const isTodayView = isToday(currentDate);

  return (
    <div className="space-y-4">
      {/* Date header */}
      <div
        className={cn(
          "text-center py-4 rounded-xl",
          isTodayView ? "bg-primary/10" : "bg-muted/50"
        )}
      >
        <p className="text-sm text-muted-foreground uppercase">
          {format(currentDate, "EEEE", { locale: sv })}
        </p>
        <p
          className={cn(
            "text-4xl font-bold",
            isTodayView && "text-primary"
          )}
        >
          {format(currentDate, "d MMMM", { locale: sv })}
        </p>
        {isTodayView && (
          <p className="text-sm text-primary font-medium mt-1">Idag</p>
        )}
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border rounded-xl bg-card overflow-hidden">
          <div className="p-3 border-b bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">
              Heldagshändelser
            </p>
          </div>
          <div className="p-2 space-y-2">
            {allDayEvents.map((event) => {
              const eventColor =
                event.color || categoryColors[event.event_category || "custom"];
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left p-3 rounded-lg text-white font-medium transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: eventColor }}
                >
                  <div className="flex items-center gap-2">
                    {event.event_type === "major_event" && (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span className="font-semibold">{event.title}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm opacity-90 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 400px)" }}
        >
          <div className="grid grid-cols-[60px_1fr] relative">
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

            {/* Event column */}
            <div className="relative">
              {/* Hour slots */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                  style={{ height: HOUR_HEIGHT }}
                  onClick={() => onTimeSlotClick(hour)}
                />
              ))}

              {/* Timed events */}
              {timedEvents.map((event, eventIndex) => {
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
                    className="absolute left-1 right-1 p-2 rounded-lg text-white font-medium overflow-hidden text-left transition-transform hover:scale-[1.01]"
                    style={{
                      top,
                      height,
                      backgroundColor: eventColor,
                      zIndex: 10 + eventIndex,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {event.event_type === "major_event" && (
                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="font-semibold truncate">
                        {event.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(parseISO(event.start_date), "HH:mm")}
                        {event.end_date &&
                          ` - ${format(parseISO(event.end_date), "HH:mm")}`}
                      </span>
                    </div>
                    {event.description && height > 80 && (
                      <p className="text-xs opacity-80 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </button>
                );
              })}

              {/* Current time indicator */}
              {isTodayView && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-destructive z-20"
                  style={{ top: currentTimePosition }}
                >
                  <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
