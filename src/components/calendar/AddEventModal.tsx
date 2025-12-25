import { useState } from "react";
import { format, differenceInWeeks } from "date-fns";
import { sv } from "date-fns/locale";
import { Calendar as CalendarIcon, Sparkles, Plus, Trash2, Clock } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateEvent } from "@/hooks/useEvents";
import { useCreateTimelinePhases } from "@/hooks/useTimeline";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  householdCode: string;
}

interface TimelinePhaseInput {
  id: string;
  phase_name: string;
  weeks_before: number;
  description: string;
}

const eventCategories = [
  { value: "custom", label: "Övrigt" },
  { value: "birthday", label: "Födelsedag" },
  { value: "christmas", label: "Jul" },
  { value: "easter", label: "Påsk" },
  { value: "midsummer", label: "Midsommar" },
  { value: "new_year", label: "Nyår" },
  { value: "wedding", label: "Bröllop" },
  { value: "graduation", label: "Examen" },
  { value: "anniversary", label: "Årsdag" },
];

const eventColors = [
  { value: "#3b82f6", label: "Blå" },
  { value: "#22c55e", label: "Grön" },
  { value: "#ef4444", label: "Röd" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Lila" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6366f1", label: "Indigo" },
];

const defaultTimelinePhases: TimelinePhaseInput[] = [
  { id: "1", phase_name: "8 veckor kvar", weeks_before: 8, description: "Börja planera och sätt budget" },
  { id: "2", phase_name: "4 veckor kvar", weeks_before: 4, description: "Bekräfta gästlista och meny" },
  { id: "3", phase_name: "2 veckor kvar", weeks_before: 2, description: "Handla och förbered" },
  { id: "4", phase_name: "1 vecka kvar", weeks_before: 1, description: "Sista förberedelser" },
  { id: "5", phase_name: "Dagen innan", weeks_before: 0, description: "Städa och dekorera" },
];

const AddEventModal = ({
  isOpen,
  onClose,
  selectedDate,
  householdCode,
}: AddEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"simple" | "major_event">("simple");
  const [category, setCategory] = useState("custom");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("yearly");

  // Major event options
  const [hasTimeline, setHasTimeline] = useState(true);
  const [hasBudget, setHasBudget] = useState(false);
  const [hasGuestList, setHasGuestList] = useState(false);
  const [timelinePhases, setTimelinePhases] = useState<TimelinePhaseInput[]>(defaultTimelinePhases);

  const createEvent = useCreateEvent();
  const createTimelinePhases = useCreateTimelinePhases();

  const addTimelinePhase = () => {
    const newPhase: TimelinePhaseInput = {
      id: Date.now().toString(),
      phase_name: "",
      weeks_before: 1,
      description: "",
    };
    setTimelinePhases([...timelinePhases, newPhase]);
  };

  const removeTimelinePhase = (id: string) => {
    setTimelinePhases(timelinePhases.filter((p) => p.id !== id));
  };

  const updateTimelinePhase = (
    id: string,
    field: keyof TimelinePhaseInput,
    value: string | number
  ) => {
    setTimelinePhases(
      timelinePhases.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Ange en titel för händelsen");
      return;
    }

    const startDate = new Date(selectedDate);
    if (!allDay) {
      const [hours, minutes] = startTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    } else {
      startDate.setHours(0, 0, 0, 0);
    }

    let endDate: Date | null = null;
    if (!allDay) {
      endDate = new Date(selectedDate);
      const [hours, minutes] = endTime.split(":").map(Number);
      endDate.setHours(hours, minutes, 0, 0);
    }

    try {
      const event = await createEvent.mutateAsync({
        household_code: householdCode,
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        event_category: category,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        all_day: allDay,
        recurring,
        recurring_pattern: recurring ? recurringPattern : null,
        color: color || null,
        has_timeline: eventType === "major_event" && hasTimeline,
        has_budget: eventType === "major_event" && hasBudget,
        has_guest_list: eventType === "major_event" && hasGuestList,
        theme_settings: null,
        created_by: null,
      });

      // Create timeline phases for major events
      if (eventType === "major_event" && hasTimeline && timelinePhases.length > 0) {
        const validPhases = timelinePhases.filter((p) => p.phase_name.trim());
        if (validPhases.length > 0) {
          await createTimelinePhases.mutateAsync(
            validPhases.map((p, index) => ({
              event_id: event.id,
              phase_name: p.phase_name,
              weeks_before: p.weeks_before,
              description: p.description || null,
              sort_order: index,
            }))
          );
        }
      }

      toast.success("Händelse skapad!");
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Kunde inte skapa händelsen");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventType("simple");
    setCategory("custom");
    setAllDay(true);
    setStartTime("09:00");
    setEndTime("10:00");
    setColor("");
    setRecurring(false);
    setRecurringPattern("yearly");
    setHasTimeline(true);
    setHasBudget(false);
    setHasGuestList(false);
    setTimelinePhases(defaultTimelinePhases);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isMajorEvent = eventType === "major_event";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isMajorEvent ? (
              <Sparkles className="w-5 h-5 text-accent" />
            ) : (
              <CalendarIcon className="w-5 h-5 text-primary" />
            )}
            Ny händelse
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date display */}
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <p className="text-sm text-muted-foreground">Datum</p>
            <p className="font-semibold capitalize">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: sv })}
            </p>
          </div>

          {/* Event type toggle */}
          <div className="space-y-2">
            <Label>Typ av händelse</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventType("simple")}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-left",
                  eventType === "simple"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <CalendarIcon className="w-5 h-5 mb-1 text-primary" />
                <p className="font-semibold text-sm">Enkel</p>
                <p className="text-xs text-muted-foreground">Vanlig händelse</p>
              </button>
              <button
                type="button"
                onClick={() => setEventType("major_event")}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-left",
                  eventType === "major_event"
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                )}
              >
                <Sparkles className="w-5 h-5 mb-1 text-accent" />
                <p className="font-semibold text-sm">Storhelg</p>
                <p className="text-xs text-muted-foreground">Med planering</p>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isMajorEvent ? "T.ex. Jul 2025" : "T.ex. Mormors födelsedag"}
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

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {eventCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Major event options */}
          {isMajorEvent && (
            <div className="space-y-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Planeringsverktyg
              </h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="hasTimeline"
                    checked={hasTimeline}
                    onCheckedChange={(checked) => setHasTimeline(!!checked)}
                  />
                  <Label htmlFor="hasTimeline" className="font-normal cursor-pointer">
                    Tidslinje med faser
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="hasBudget"
                    checked={hasBudget}
                    onCheckedChange={(checked) => setHasBudget(!!checked)}
                  />
                  <Label htmlFor="hasBudget" className="font-normal cursor-pointer">
                    Budget
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="hasGuestList"
                    checked={hasGuestList}
                    onCheckedChange={(checked) => setHasGuestList(!!checked)}
                  />
                  <Label htmlFor="hasGuestList" className="font-normal cursor-pointer">
                    Gästlista
                  </Label>
                </div>
              </div>

              {/* Timeline phases */}
              {hasTimeline && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Tidslinjefaser</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addTimelinePhase}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Lägg till fas
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {timelinePhases.map((phase, index) => (
                      <div
                        key={phase.id}
                        className="flex items-start gap-2 p-2 bg-background rounded-lg border"
                      >
                        <div className="flex-1 space-y-2">
                          <Input
                            value={phase.phase_name}
                            onChange={(e) =>
                              updateTimelinePhase(phase.id, "phase_name", e.target.value)
                            }
                            placeholder="Namn på fas"
                            className="h-8 text-sm"
                          />
                          <div className="flex gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <Input
                                type="number"
                                min="0"
                                value={phase.weeks_before}
                                onChange={(e) =>
                                  updateTimelinePhase(
                                    phase.id,
                                    "weeks_before",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-7 w-16 text-xs"
                              />
                              <span className="text-xs text-muted-foreground">
                                veckor före
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimelinePhase(phase.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All day toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="allDay">Heldag</Label>
            <Switch id="allDay" checked={allDay} onCheckedChange={setAllDay} />
          </div>

          {/* Time inputs */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Starttid</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Sluttid</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Färg</Label>
            <div className="flex flex-wrap gap-2">
              {eventColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(color === c.value ? "" : c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Recurring toggle - only for simple events */}
          {!isMajorEvent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="recurring">Återkommande</Label>
                <Switch
                  id="recurring"
                  checked={recurring}
                  onCheckedChange={setRecurring}
                />
              </div>
              {recurring && (
                <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="yearly">Varje år</SelectItem>
                    <SelectItem value="monthly">Varje månad</SelectItem>
                    <SelectItem value="weekly">Varje vecka</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              variant={isMajorEvent ? "warm" : "hero"}
              className="flex-1"
              disabled={createEvent.isPending || createTimelinePhases.isPending}
            >
              {createEvent.isPending ? "Sparar..." : "Spara händelse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
