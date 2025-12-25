import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
} from "date-fns";
import { Event } from "@/hooks/useEvents";
import CalendarCell from "./CalendarCell";

interface MonthGridProps {
  currentDate: Date;
  events: Event[];
  onDayClick: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

const weekDays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

const MonthGrid = ({ currentDate, events, onDayClick, onEventClick }: MonthGridProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  return (
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

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: adjustedStartDay }).map((_, index) => (
          <div
            key={`empty-start-${index}`}
            className="min-h-[70px] md:min-h-[100px] p-2 border-t border-r border-border bg-muted/20"
          />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const dayOfWeek = getDay(day);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const dayEvents = getEventsForDay(day);

          return (
            <CalendarCell
              key={day.toISOString()}
              day={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isToday(day)}
              isWeekend={isWeekend}
              events={dayEvents}
              onClick={() => onDayClick(day)}
              onEventClick={onEventClick}
            />
          );
        })}

        {/* Empty cells to complete the grid */}
        {Array.from({
          length: (7 - ((adjustedStartDay + days.length) % 7)) % 7,
        }).map((_, index) => (
          <div
            key={`empty-end-${index}`}
            className="min-h-[70px] md:min-h-[100px] p-2 border-t border-r border-border bg-muted/20"
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGrid;
