import { Calendar, CalendarDays, CalendarRange, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week" | "day" | "year";

interface CalendarViewSwitcherProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const views: { value: CalendarView; label: string; icon: React.ReactNode }[] = [
  { value: "day", label: "Dag", icon: <Calendar className="w-4 h-4" /> },
  { value: "week", label: "Vecka", icon: <CalendarRange className="w-4 h-4" /> },
  { value: "month", label: "Månad", icon: <CalendarDays className="w-4 h-4" /> },
  { value: "year", label: "År", icon: <Grid3X3 className="w-4 h-4" /> },
];

const CalendarViewSwitcher = ({
  currentView,
  onViewChange,
}: CalendarViewSwitcherProps) => {
  return (
    <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
      {views.map((view) => (
        <Button
          key={view.value}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(view.value)}
          className={cn(
            "rounded-md px-3 gap-1.5 text-xs font-medium transition-all",
            currentView === view.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default CalendarViewSwitcher;
