import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Reminder {
  id: string;
  timeBefore: string;
  timeUnit: "hours" | "days" | "weeks";
}

interface ReminderSectionProps {
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
}

const timeOptions = [
  { value: "1-hours", label: "1 timme innan" },
  { value: "2-hours", label: "2 timmar innan" },
  { value: "1-days", label: "1 dag innan" },
  { value: "2-days", label: "2 dagar innan" },
  { value: "3-days", label: "3 dagar innan" },
  { value: "1-weeks", label: "1 vecka innan" },
  { value: "2-weeks", label: "2 veckor innan" },
];

const ReminderSection = ({ reminders, onRemindersChange }: ReminderSectionProps) => {
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
    const [timeBefore, timeUnit] = value.split("-") as [string, "hours" | "days" | "weeks"];
    onRemindersChange(
      reminders.map((r) =>
        r.id === id ? { ...r, timeBefore, timeUnit } : r
      )
    );
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
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-2">
              <Select
                value={`${reminder.timeBefore}-${reminder.timeUnit}`}
                onValueChange={(v) => updateReminder(reminder.id, v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {timeOptions.map((opt) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderSection;
