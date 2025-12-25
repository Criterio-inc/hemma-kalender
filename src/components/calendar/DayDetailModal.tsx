import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Plus, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Event } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: Event[];
  onAddEvent: () => void;
  onEventClick: (event: Event) => void;
}

const eventCategoryLabels: Record<string, string> = {
  birthday: "Födelsedag",
  christmas: "Jul",
  wedding: "Bröllop",
  easter: "Påsk",
  midsummer: "Midsommar",
  new_year: "Nyår",
  graduation: "Examen",
  anniversary: "Årsdag",
  custom: "Övrigt",
};

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

const DayDetailModal = ({
  isOpen,
  onClose,
  date,
  events,
  onAddEvent,
  onEventClick,
}: DayDetailModalProps) => {
  const formattedDate = format(date, "EEEE d MMMM yyyy", { locale: sv });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl capitalize">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Events list */}
          {events.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                <CalendarIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">
                Inga händelser denna dag
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Lägg till en händelse för att komma igång
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                        event.color
                          ? ""
                          : eventColors[event.event_category || "custom"] || "bg-primary"
                      )}
                      style={
                        event.color ? { backgroundColor: event.color } : undefined
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {!event.all_day && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(event.start_date), "HH:mm")}
                          </span>
                        )}
                        {event.all_day && <span>Heldag</span>}
                        <span className="text-muted-foreground/50">•</span>
                        <span>
                          {eventCategoryLabels[event.event_category || "custom"] || "Övrigt"}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Add event button */}
          <Button onClick={onAddEvent} className="w-full" variant="hero">
            <Plus className="w-4 h-4" />
            Lägg till händelse
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailModal;
