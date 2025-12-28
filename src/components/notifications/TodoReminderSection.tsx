import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TodoReminder {
  id: string;
  type: "on_due" | "before_due" | "phase_assigned";
  daysBefore?: number;
}

interface TodoReminderSectionProps {
  reminders: TodoReminder[];
  onRemindersChange: (reminders: TodoReminder[]) => void;
  hasDueDate: boolean;
  hasPhase: boolean;
}

const TodoReminderSection = ({
  reminders,
  onRemindersChange,
  hasDueDate,
  hasPhase,
}: TodoReminderSectionProps) => {
  const hasOnDueReminder = reminders.some((r) => r.type === "on_due");
  const hasBeforeDueReminder = reminders.some((r) => r.type === "before_due");
  const hasPhaseReminder = reminders.some((r) => r.type === "phase_assigned");

  const toggleReminder = (type: TodoReminder["type"], enabled: boolean) => {
    if (enabled) {
      const newReminder: TodoReminder = {
        id: Date.now().toString(),
        type,
        daysBefore: type === "before_due" ? 1 : undefined,
      };
      onRemindersChange([...reminders, newReminder]);
    } else {
      onRemindersChange(reminders.filter((r) => r.type !== type));
    }
  };

  const updateDaysBefore = (days: number) => {
    onRemindersChange(
      reminders.map((r) =>
        r.type === "before_due" ? { ...r, daysBefore: days } : r
      )
    );
  };

  const beforeDueReminder = reminders.find((r) => r.type === "before_due");

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Påminnelser
      </Label>

      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
        {/* On due date */}
        {hasDueDate && (
          <div className="flex items-center gap-3">
            <Checkbox
              id="reminder-on-due"
              checked={hasOnDueReminder}
              onCheckedChange={(checked) => toggleReminder("on_due", !!checked)}
            />
            <Label htmlFor="reminder-on-due" className="font-normal cursor-pointer">
              Påminn på förfallodatum
            </Label>
          </div>
        )}

        {/* Before due date */}
        {hasDueDate && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="reminder-before-due"
                checked={hasBeforeDueReminder}
                onCheckedChange={(checked) => toggleReminder("before_due", !!checked)}
              />
              <Label htmlFor="reminder-before-due" className="font-normal cursor-pointer">
                Påminn innan förfallodatum
              </Label>
            </div>
            {hasBeforeDueReminder && (
              <Select
                value={String(beforeDueReminder?.daysBefore || 1)}
                onValueChange={(v) => updateDaysBefore(Number(v))}
              >
                <SelectTrigger className="ml-6 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="1">1 dag innan</SelectItem>
                  <SelectItem value="2">2 dagar innan</SelectItem>
                  <SelectItem value="3">3 dagar innan</SelectItem>
                  <SelectItem value="7">1 vecka innan</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Phase assigned */}
        {hasPhase && (
          <div className="flex items-center gap-3">
            <Checkbox
              id="reminder-phase"
              checked={hasPhaseReminder}
              onCheckedChange={(checked) => toggleReminder("phase_assigned", !!checked)}
            />
            <Label htmlFor="reminder-phase" className="font-normal cursor-pointer">
              Påminn när tidslinjefas börjar
            </Label>
          </div>
        )}

        {!hasDueDate && !hasPhase && (
          <p className="text-sm text-muted-foreground">
            Lägg till ett förfallodatum eller en tidslinjefas för att aktivera påminnelser.
          </p>
        )}
      </div>
    </div>
  );
};

export default TodoReminderSection;
