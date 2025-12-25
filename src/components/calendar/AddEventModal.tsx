import { useState } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { useCreateEvent } from "@/hooks/useEvents";
import { toast } from "sonner";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  householdCode: string;
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

const AddEventModal = ({
  isOpen,
  onClose,
  selectedDate,
  householdCode,
}: AddEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("yearly");

  const createEvent = useCreateEvent();

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
      await createEvent.mutateAsync({
        household_code: householdCode,
        title: title.trim(),
        description: description.trim() || null,
        event_type: "simple",
        event_category: category,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        all_day: allDay,
        recurring,
        recurring_pattern: recurring ? recurringPattern : null,
        color: color || null,
        theme_settings: null,
        created_by: null,
      });

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
    setCategory("custom");
    setAllDay(true);
    setStartTime("09:00");
    setEndTime("10:00");
    setColor("");
    setRecurring(false);
    setRecurringPattern("yearly");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-5 h-5 text-primary" />
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

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Mormors födelsedag"
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
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* All day toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="allDay">Heldag</Label>
            <Switch
              id="allDay"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
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
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
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
                <SelectContent>
                  <SelectItem value="yearly">Varje år</SelectItem>
                  <SelectItem value="monthly">Varje månad</SelectItem>
                  <SelectItem value="weekly">Varje vecka</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Submit button */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Avbryt
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? "Sparar..." : "Spara"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
