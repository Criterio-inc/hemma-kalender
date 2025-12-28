import { memo } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Event } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: Event[];
  onClick: () => void;
  onEventClick?: (event: Event) => void;
  tabIndex?: number;
  onFocus?: () => void;
}

const eventColors: Record<string, string> = {
  birthday: "bg-pink-400",
  christmas: "bg-red-500",
  wedding: "bg-purple-400",
  easter: "bg-yellow-400",
  midsummer: "bg-green-400",
  new_year: "bg-blue-400",
  graduation: "bg-indigo-400",
  anniversary: "bg-rose-400",
  custom: "bg-primary",
};

// Custom comparison function for memoization
function arePropsEqual(prevProps: CalendarCellProps, nextProps: CalendarCellProps): boolean {
  // Compare primitive props
  if (prevProps.isCurrentMonth !== nextProps.isCurrentMonth) return false;
  if (prevProps.isToday !== nextProps.isToday) return false;
  if (prevProps.isWeekend !== nextProps.isWeekend) return false;
  if (prevProps.day.getTime() !== nextProps.day.getTime()) return false;
  if (prevProps.tabIndex !== nextProps.tabIndex) return false;
  
  // Compare events by length and IDs
  if (prevProps.events.length !== nextProps.events.length) return false;
  
  // Compare event IDs (shallow comparison is enough)
  for (let i = 0; i < prevProps.events.length; i++) {
    if (prevProps.events[i].id !== nextProps.events[i].id) return false;
    if (prevProps.events[i].title !== nextProps.events[i].title) return false;
  }
  
  // Callbacks are stable if using useCallback in parent
  return true;
}

const CalendarCell = memo(function CalendarCell({
  day,
  isCurrentMonth,
  isToday,
  isWeekend,
  events,
  onClick,
  onEventClick,
  tabIndex = 0,
  onFocus,
}: CalendarCellProps) {
  const dayEvents = events.slice(0, 3);
  const moreCount = events.length - 3;
  const eventCount = events.length;

  return (
    <button
      onClick={onClick}
      onFocus={onFocus}
      tabIndex={tabIndex}
      aria-label={`${format(day, 'd MMMM', { locale: sv })}${eventCount > 0 ? `, ${eventCount} händelse${eventCount > 1 ? 'r' : ''}` : ''}`}
      className={cn(
        "min-h-[70px] md:min-h-[100px] p-1.5 md:p-2 border-t border-r border-border transition-all duration-200 text-left flex flex-col touch-target touch-manipulation",
        "hover:bg-primary/5 focus-visible-ring",
        !isCurrentMonth && "bg-muted/30",
        isWeekend && isCurrentMonth && "bg-accent/5"
      )}
    >
      {/* Day number */}
      <span
        className={cn(
          "inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-sm font-semibold transition-all",
          isToday
            ? "bg-primary text-primary-foreground shadow-sm"
            : isWeekend
            ? "text-accent"
            : isCurrentMonth
            ? "text-foreground"
            : "text-muted-foreground/50"
        )}
        aria-hidden="true"
      >
        {format(day, "d")}
      </span>

      {/* Screen reader text for event count */}
      {eventCount > 0 && (
        <span className="sr-only">
          {eventCount} händelse{eventCount > 1 ? 'r' : ''}: {events.map(e => e.title).join(', ')}
        </span>
      )}

      {/* Event dots */}
      <div className="flex flex-wrap gap-1 mt-1" aria-hidden="true">
        {dayEvents.map((event) => (
          <button
            key={event.id}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick?.(event);
            }}
            className={cn(
              "w-2 h-2 rounded-full hover:scale-150 transition-transform cursor-pointer focus-visible-ring",
              event.color ? "" : eventColors[event.event_category || "custom"] || "bg-primary"
            )}
            style={event.color ? { backgroundColor: event.color } : undefined}
            title={event.title}
            aria-label={`Visa ${event.title}`}
            tabIndex={-1}
          />
        ))}
        {moreCount > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium">
            +{moreCount}
          </span>
        )}
      </div>

      {/* Event titles on larger screens */}
      <div className="hidden md:flex flex-col gap-0.5 mt-1 overflow-hidden flex-1" aria-hidden="true">
        {dayEvents.slice(0, 2).map((event) => (
          <button
            key={event.id}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick?.(event);
            }}
            className={cn(
              "text-xs px-1.5 py-0.5 rounded truncate font-medium text-left hover:opacity-80 transition-opacity cursor-pointer focus-visible-ring",
              event.color ? "text-foreground" : "text-primary-foreground"
            )}
            style={{
              backgroundColor: event.color || undefined,
              ...(event.color ? {} : { backgroundColor: "hsl(var(--primary))" }),
            }}
            aria-label={`Visa ${event.title}`}
            tabIndex={-1}
          >
            {event.title}
          </button>
        ))}
        {events.length > 2 && (
          <span className="text-[10px] text-muted-foreground font-medium px-1">
            +{events.length - 2} mer
          </span>
        )}
      </div>
    </button>
  );
}, arePropsEqual);

export default CalendarCell;
