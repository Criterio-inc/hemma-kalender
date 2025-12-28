import { useState } from "react";
import { Bell, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format, subHours, subDays, subWeeks } from "date-fns";
import { sv } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";

export interface Reminder {
  id: string;
  timeBefore: string;
  timeUnit: "hours" | "days" | "weeks";
  customDate?: Date;
}

interface ReminderSectionProps {
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
  eventDate?: Date;
}

const presetOptions = [
  { value: "1-hours", label: "1 timme innan" },
  { value: "2-hours", label: "2 timmar innan" },
  { value: "1-days", label: "1 dag innan" },
  { value: "3-days", label: "3 dagar innan" },
  { value: "1-weeks", label: "1 vecka innan" },
  { value: "2-weeks", label: "2 veckor innan" },
  { value: "custom", label: "Anpassad..." },
];

const ReminderSection = ({ reminders, onRemindersChange, eventDate }: ReminderSectionProps) => {
  const addReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      timeBefore: "1",
      timeUnit: "days",
    };
    onRemindersChange([...reminders, newReminder]);
  };

  const removeReminder = (id: string) => {
    onRemindersChange(reminders.filter((r) => r.id !== id));
  };

  const updateReminder = (id: string, value: string) => {
    if (value === "custom") {
      onRemindersChange(
        reminders.map((r) =>
          r.id === id
            ? { ...r, timeBefore: "custom", timeUnit: "days" as const, customDate: eventDate }
            : r
        )
      );
    } else {
      const [timeBefore, timeUnit] = value.split("-") as [string, "hours" | "days" | "weeks"];
      onRemindersChange(
        reminders.map((r) =>
          r.id === id ? { ...r, timeBefore, timeUnit, customDate: undefined } : r
        )
      );
    }
  };

  const updateCustomDate = (id: string, date: Date | undefined) => {
    if (date) {
      onRemindersChange(
        reminders.map((r) =>
          r.id === id ? { ...r, customDate: date } : r
        )
      );
    }
  };

  const getReminderPreview = (reminder: Reminder): string | null => {
    if (!eventDate) return null;
    
    let scheduledDate: Date;
    
    if (reminder.customDate) {
      scheduledDate = reminder.customDate;
    } else {
      const timeBefore = parseInt(reminder.timeBefore);
      switch (reminder.timeUnit) {
        case "hours":
          scheduledDate = subHours(eventDate, timeBefore);
          break;
        case "weeks":
          scheduledDate = subWeeks(eventDate, timeBefore);
          break;
        default:
          scheduledDate = subDays(eventDate, timeBefore);
      }
    }
    
    return `Du får påminnelse ${format(scheduledDate, "d MMM 'kl' HH:mm", { locale: sv })}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Påminnelser
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addReminder}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Lägg till
        </Button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Inga påminnelser. Klicka för att lägga till.
        </p>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  value={
                    reminder.customDate
                      ? "custom"
                      : `${reminder.timeBefore}-${reminder.timeUnit}`
                  }
                  onValueChange={(v) => updateReminder(reminder.id, v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {presetOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReminder(reminder.id)}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Custom date picker */}
              {reminder.customDate !== undefined && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reminder.customDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reminder.customDate
                        ? format(reminder.customDate, "PPP HH:mm", { locale: sv })
                        : "Välj datum och tid"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reminder.customDate}
                      onSelect={(date) => updateCustomDate(reminder.id, date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Preview */}
              {eventDate && (
                <p className="text-xs text-muted-foreground pl-1">
                  {getReminderPreview(reminder)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderSection;
