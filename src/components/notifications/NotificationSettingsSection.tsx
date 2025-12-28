import { useState } from "react";
import { Bell, Volume2, VolumeX, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Preferences, QuietHours, CategoryNotificationSettings } from "@/hooks/usePreferences";
import { cn } from "@/lib/utils";

interface NotificationSettingsSectionProps {
  preferences: Preferences;
  onPreferenceChange: (key: keyof Preferences, value: unknown) => void;
  isLoading: boolean;
}

const defaultReminderOptions = [
  { value: "1440", label: "1 dag innan" },
  { value: "10080", label: "1 vecka innan" },
  { value: "20160", label: "2 veckor innan" },
  { value: "43200", label: "1 månad innan" },
];

const categoryLabels: Record<keyof CategoryNotificationSettings, string> = {
  birthday: "Födelsedagar",
  christmas: "Jul",
  easter: "Påsk",
  midsummer: "Midsommar",
  wedding: "Bröllop",
  custom: "Övriga händelser",
};

const NotificationSettingsSection = ({
  preferences,
  onPreferenceChange,
  isLoading,
}: NotificationSettingsSectionProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  const handleQuietHoursChange = (field: keyof QuietHours, value: boolean | string) => {
    const updated = { ...preferences.quiet_hours, [field]: value };
    onPreferenceChange("quiet_hours", updated);
  };

  const handleCategoryChange = (category: keyof CategoryNotificationSettings, enabled: boolean) => {
    const updated = { ...preferences.category_notifications, [category]: enabled };
    onPreferenceChange("category_notifications", updated);
  };

  return (
    <div className="space-y-4">
      {/* General Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Allmänna aviseringar
          </CardTitle>
          <CardDescription>Hantera dina aviseringsinställningar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Aktivera aviseringar</Label>
              <p className="text-sm text-muted-foreground">
                Ta emot påminnelser för händelser och uppgifter
              </p>
            </div>
            <Switch
              checked={preferences.notifications_enabled}
              onCheckedChange={(v) => onPreferenceChange("notifications_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {preferences.notification_sound ? (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label>Aviseringsljud</Label>
                <p className="text-sm text-muted-foreground">
                  Spela ljud vid nya aviseringar
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notification_sound}
              onCheckedChange={(v) => onPreferenceChange("notification_sound", v)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Standard påminnelsetid</Label>
            <Select
              value={String(preferences.default_reminder_times[0] || 1440)}
              onValueChange={(v) => onPreferenceChange("default_reminder_times", [Number(v)])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {defaultReminderOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Nya händelser kommer automatiskt få en påminnelse
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tysta timmar
          </CardTitle>
          <CardDescription>Undvik aviseringar under natten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Aktivera tysta timmar</Label>
              <p className="text-sm text-muted-foreground">
                Inga aviseringar under vald tidsperiod
              </p>
            </div>
            <Switch
              checked={preferences.quiet_hours.enabled}
              onCheckedChange={(v) => handleQuietHoursChange("enabled", v)}
            />
          </div>

          {preferences.quiet_hours.enabled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Från</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={preferences.quiet_hours.start}
                  onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">Till</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={preferences.quiet_hours.end}
                  onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Kategoriinställningar
          </CardTitle>
          <CardDescription>Välj vilka typer av händelser du vill få aviseringar för</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(categoryLabels) as Array<keyof CategoryNotificationSettings>).map(
            (category) => (
              <div key={category} className="flex items-center justify-between py-1">
                <Label className="font-normal">{categoryLabels[category]}</Label>
                <Switch
                  checked={preferences.category_notifications[category]}
                  onCheckedChange={(v) => handleCategoryChange(category, v)}
                />
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Smart Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Smarta aviseringar</CardTitle>
          <CardDescription>Automatiska påminnelser och sammanfattningar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Veckosammanfattning</Label>
              <p className="text-sm text-muted-foreground">
                Få en sammanfattning varje söndag kväll
              </p>
            </div>
            <Switch
              checked={preferences.weekly_summary}
              onCheckedChange={(v) => onPreferenceChange("weekly_summary", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Försenade uppgifter</Label>
              <p className="text-sm text-muted-foreground">
                Avisering för uppgifter som passerat förfallodatum
              </p>
            </div>
            <Switch
              checked={preferences.todo_overdue_notifications}
              onCheckedChange={(v) => onPreferenceChange("todo_overdue_notifications", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettingsSection;
