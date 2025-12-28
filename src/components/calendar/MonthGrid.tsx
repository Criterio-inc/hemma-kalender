import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  format,
  addDays,
  subDays,
} from "date-fns";
import { sv } from "date-fns/locale";
import { Event } from "@/hooks/useEvents";
import CalendarCell from "./CalendarCell";

interface MonthGridProps {
  currentDate: Date;
  events: Event[];
  onDayClick: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

const weekDays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const weekDaysFull = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

const MonthGrid = ({ currentDate, events, onDayClick, onEventClick }: MonthGridProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Adjust for Swedish calendar (week starts on Monday)
  const startDayOfWeek = getDay(monthStart);
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Create a map of events by date for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = new Date(event.start_date).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const getEventsForDay = (day: Date): Event[] => {
    return eventsByDate.get(day.toDateString()) || [];
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalDays = days.length;
    let newIndex = focusedIndex;

    switch (e.key) {
      case "ArrowRight":
        newIndex = Math.min(focusedIndex + 1, totalDays - 1);
        e.preventDefault();
        break;
      case "ArrowLeft":
        newIndex = Math.max(focusedIndex - 1, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        newIndex = Math.min(focusedIndex + 7, totalDays - 1);
        e.preventDefault();
        break;
      case "ArrowUp":
        newIndex = Math.max(focusedIndex - 7, 0);
        e.preventDefault();
        break;
      case "Home":
        newIndex = 0;
        e.preventDefault();
        break;
      case "End":
        newIndex = totalDays - 1;
        e.preventDefault();
        break;
      case "Enter":
      case " ":
        if (focusedIndex >= 0 && focusedIndex < totalDays) {
          onDayClick(days[focusedIndex]);
          e.preventDefault();
        }
        break;
      default:
        return;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  }, [focusedIndex, days, onDayClick]);

  // Focus the button when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current) {
      const buttons = gridRef.current.querySelectorAll('[role="gridcell"] button');
      if (buttons[focusedIndex]) {
        (buttons[focusedIndex] as HTMLButtonElement).focus();
      }
    }
  }, [focusedIndex]);

  return (
    <div 
      className="bg-card rounded-2xl shadow-md border border-border overflow-hidden"
      role="grid"
      aria-label={`Kalender för ${format(currentDate, 'MMMM yyyy', { locale: sv })}`}
    >
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-muted/50" role="row">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-semibold ${
              index >= 5 ? "text-accent" : "text-muted-foreground"
            }`}
            role="columnheader"
            aria-label={weekDaysFull[index]}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div 
        ref={gridRef}
        className="grid grid-cols-7" 
        role="rowgroup"
        onKeyDown={handleKeyDown}
      >
        {/* Empty cells for days before month starts */}
        {Array.from({ length: adjustedStartDay }).map((_, index) => (
          <div
            key={`empty-start-${index}`}
            className="min-h-[70px] md:min-h-[100px] p-2 border-t border-r border-border bg-muted/20"
            role="gridcell"
            aria-hidden="true"
          />
        ))}

        {/* Actual days */}
        {days.map((day, index) => {
          const dayOfWeek = getDay(day);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const dayEvents = getEventsForDay(day);
          const eventCount = dayEvents.length;

          return (
            <div 
              key={day.toISOString()} 
              role="gridcell"
              aria-label={`${format(day, 'd MMMM', { locale: sv })}${eventCount > 0 ? `, ${eventCount} händelse${eventCount > 1 ? 'r' : ''}` : ''}`}
            >
              <CalendarCell
                day={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isToday(day)}
                isWeekend={isWeekend}
                events={dayEvents}
                onClick={() => {
                  setFocusedIndex(index);
                  onDayClick(day);
                }}
                onEventClick={onEventClick}
                tabIndex={index === focusedIndex || (focusedIndex === -1 && isToday(day)) ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
              />
            </div>
          );
        })}

        {/* Empty cells to complete the grid */}
        {Array.from({
          length: (7 - ((adjustedStartDay + days.length) % 7)) % 7,
        }).map((_, index) => (
          <div
            key={`empty-end-${index}`}
            className="min-h-[70px] md:min-h-[100px] p-2 border-t border-r border-border bg-muted/20"
            role="gridcell"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGrid;
