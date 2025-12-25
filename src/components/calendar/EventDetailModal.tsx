import { useState } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Event, useUpdateEvent, useDeleteEvent } from "@/hooks/useEvents";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
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

const EventDetailModal = ({ isOpen, onClose, event }: EventDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || "");
  const [category, setCategory] = useState(event.event_category || "custom");
  const [allDay, setAllDay] = useState(event.all_day ?? true);
  const [startTime, setStartTime] = useState(
    format(new Date(event.start_date), "HH:mm")
  );
  const [endTime, setEndTime] = useState(
    event.end_date ? format(new Date(event.end_date), "HH:mm") : "10:00"
  );
  const [color, setColor] = useState(event.color || "");
  const [recurring, setRecurring] = useState(event.recurring ?? false);
  const [recurringPattern, setRecurringPattern] = useState(
    event.recurring_pattern || "yearly"
  );

  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const eventColor = event.color || categoryColors[event.event_category || "custom"];
  const categoryLabel =
    eventCategories.find((c) => c.value === event.event_category)?.label || "Övrigt";

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Ange en titel för händelsen");
      return;
    }

    const startDate = new Date(event.start_date);
    if (!allDay) {
      const [hours, minutes] = startTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }

    let endDate: Date | null = null;
    if (!allDay && event.end_date) {
      endDate = new Date(event.start_date);
      const [hours, minutes] = endTime.split(":").map(Number);
      endDate.setHours(hours, minutes, 0, 0);
    }

    try {
      await updateEvent.mutateAsync({
        id: event.id,
        updates: {
          title: title.trim(),
          description: description.trim() || null,
          event_category: category,
          all_day: allDay,
          start_date: startDate.toISOString(),
          end_date: endDate?.toISOString() || null,
          color: color || null,
          recurring,
          recurring_pattern: recurring ? recurringPattern : null,
        },
      });

      toast.success("Händelse uppdaterad!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Kunde inte uppdatera händelsen");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Händelse borttagen!");
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      toast.error("Kunde inte ta bort händelsen");
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    // Reset form to original values
    setTitle(event.title);
    setDescription(event.description || "");
    setCategory(event.event_category || "custom");
    setAllDay(event.all_day ?? true);
    setColor(event.color || "");
    setRecurring(event.recurring ?? false);
    setRecurringPattern(event.recurring_pattern || "yearly");
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: eventColor }}
              />
              {isEditing ? "Redigera händelse" : event.title}
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            // Edit mode
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-5"
            >
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titel *</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="T.ex. Mormors födelsedag"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Beskrivning</Label>
                <Textarea
                  id="edit-description"
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
                  <SelectContent className="bg-popover">
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
                <Label htmlFor="edit-allDay">Heldag</Label>
                <Switch
                  id="edit-allDay"
                  checked={allDay}
                  onCheckedChange={setAllDay}
                />
              </div>

              {/* Time inputs */}
              {!allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-startTime">Starttid</Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime">Sluttid</Label>
                    <Input
                      id="edit-endTime"
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

              {/* Recurring toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-recurring">Återkommande</Label>
                  <Switch
                    id="edit-recurring"
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

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={updateEvent.isPending}
                >
                  {updateEvent.isPending ? "Sparar..." : "Spara"}
                </Button>
              </div>
            </form>
          ) : (
            // View mode
            <div className="space-y-6">
              {/* Date and time */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-foreground">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium capitalize">
                    {format(new Date(event.start_date), "EEEE d MMMM yyyy", {
                      locale: sv,
                    })}
                  </span>
                </div>
                {!event.all_day && (
                  <div className="flex items-center gap-3 text-muted-foreground mt-2">
                    <Clock className="w-5 h-5" />
                    <span>
                      {format(new Date(event.start_date), "HH:mm")}
                      {event.end_date &&
                        ` - ${format(new Date(event.end_date), "HH:mm")}`}
                    </span>
                  </div>
                )}
                {event.all_day && (
                  <p className="text-sm text-muted-foreground mt-2 ml-8">
                    Heldag
                  </p>
                )}
              </div>

              {/* Category badge */}
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: eventColor }}
                >
                  {categoryLabel}
                </span>
                {event.recurring && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                    Återkommande
                  </span>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Beskrivning
                  </h4>
                  <p className="text-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Ta bort
                </Button>
                <Button
                  variant="hero"
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Redigera
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort händelse?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort "{event.title}"? Detta kan inte
              ångras och alla relaterade uppgifter och anteckningar kommer också
              att tas bort.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEvent.isPending ? "Tar bort..." : "Ta bort"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDetailModal;
