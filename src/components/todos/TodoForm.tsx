import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Todo, TodoInsert, TodoUpdate, useCreateTodo, useUpdateTodo } from "@/hooks/useTodos";
import { useEvents, Event } from "@/hooks/useEvents";
import { useTimelinePhases } from "@/hooks/useTimeline";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sv } from "date-fns/locale";

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  householdCode: string;
  todo?: Todo | null;
  defaultEventId?: string | null;
}

const categories = [
  { value: "general", label: "Allmänt" },
  { value: "shopping", label: "Inköp" },
  { value: "cooking", label: "Matlagning" },
  { value: "decoration", label: "Dekoration" },
];

const priorities = [
  { value: "low", label: "Låg" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "Hög" },
];

const TodoForm = ({ isOpen, onClose, householdCode, todo, defaultEventId }: TodoFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");
  const [eventId, setEventId] = useState<string>("none");
  const [phaseId, setPhaseId] = useState<string>("none");

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  
  // Get events for dropdown - use a far future date to get all events
  const { data: events = [] } = useEvents(householdCode, new Date(2099, 0, 1));
  const { data: phases = [] } = useTimelinePhases(eventId !== "none" ? eventId : "");

  // Get the selected event
  const selectedEvent = events.find((e) => e.id === eventId);
  const showPhases = selectedEvent?.has_timeline && phases.length > 0;

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || "");
      setDueDate(todo.due_date ? new Date(todo.due_date) : undefined);
      setPriority(todo.priority || "medium");
      setCategory(todo.category || "general");
      setEventId(todo.event_id || "none");
      setPhaseId(todo.timeline_phase_id || "none");
    } else {
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setPriority("medium");
      setCategory("general");
      setEventId(defaultEventId || "none");
      setPhaseId("none");
    }
  }, [todo, defaultEventId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Ange en titel");
      return;
    }

    try {
      if (todo) {
        const updates: TodoUpdate = {
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate?.toISOString() || null,
          priority,
          category,
          event_id: eventId !== "none" ? eventId : null,
          timeline_phase_id: phaseId !== "none" ? phaseId : null,
        };

        await updateTodo.mutateAsync({ id: todo.id, updates });
        toast.success("Uppgift uppdaterad!");
      } else {
        const newTodo: TodoInsert = {
          household_code: householdCode,
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate?.toISOString() || null,
          priority,
          category,
          event_id: eventId !== "none" ? eventId : null,
          timeline_phase_id: phaseId !== "none" ? phaseId : null,
        };

        await createTodo.mutateAsync(newTodo);
        toast.success("Uppgift skapad!");
      }

      onClose();
    } catch (error) {
      toast.error(todo ? "Kunde inte uppdatera uppgiften" : "Kunde inte skapa uppgiften");
    }
  };

  const isPending = createTodo.isPending || updateTodo.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{todo ? "Redigera uppgift" : "Ny uppgift"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vad ska göras?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lägg till detaljer..."
              rows={2}
            />
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label>Förfallodatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: sv }) : "Välj datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioritet</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event link */}
          <div className="space-y-2">
            <Label>Kopplad till händelse</Label>
            <Select value={eventId} onValueChange={(v) => { setEventId(v); setPhaseId("none"); }}>
              <SelectTrigger>
                <SelectValue placeholder="Ingen händelse" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="none">Ingen händelse</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline phase */}
          {showPhases && (
            <div className="space-y-2">
              <Label>Tidslinjefas</Label>
              <Select value={phaseId} onValueChange={setPhaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ingen fas" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="none">Ingen fas</SelectItem>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.phase_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Avbryt
            </Button>
            <Button type="submit" variant="hero" disabled={isPending} className="flex-1">
              {isPending ? "Sparar..." : todo ? "Spara" : "Skapa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TodoForm;
