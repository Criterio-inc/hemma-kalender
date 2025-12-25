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

const CalendarCell = ({
  day,
  isCurrentMonth,
  isToday,
  isWeekend,
  events,
  onClick,
}: CalendarCellProps) => {
  const dayEvents = events.slice(0, 3);
  const moreCount = events.length - 3;

  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-[70px] md:min-h-[100px] p-1.5 md:p-2 border-t border-r border-border transition-all duration-200 text-left flex flex-col",
        "hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset",
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
      >
        {format(day, "d")}
      </span>

      {/* Event dots */}
      <div className="flex flex-wrap gap-1 mt-1">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              "w-2 h-2 rounded-full",
              event.color ? "" : eventColors[event.event_category || "custom"] || "bg-primary"
            )}
            style={event.color ? { backgroundColor: event.color } : undefined}
            title={event.title}
          />
        ))}
        {moreCount > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium">
            +{moreCount}
          </span>
        )}
      </div>

      {/* Event titles on larger screens */}
      <div className="hidden md:flex flex-col gap-0.5 mt-1 overflow-hidden flex-1">
        {dayEvents.slice(0, 2).map((event) => (
          <div
            key={event.id}
            className={cn(
              "text-xs px-1.5 py-0.5 rounded truncate font-medium",
              event.color ? "text-foreground" : "text-primary-foreground"
            )}
            style={{
              backgroundColor: event.color || undefined,
              ...(event.color ? {} : { backgroundColor: "hsl(var(--primary))" }),
            }}
          >
            {event.title}
          </div>
        ))}
        {events.length > 2 && (
          <span className="text-[10px] text-muted-foreground font-medium px-1">
            +{events.length - 2} mer
          </span>
        )}
      </div>
    </button>
  );
};

export default CalendarCell;
