import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  Calendar,
  Brain,
  Database,
  Shield,
  Info,
  ChevronRight,
  Home,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getSession, updateHouseholdName } from "@/lib/auth";
import { usePreferences, useUpdatePreferences, Preferences } from "@/hooks/usePreferences";
import { useHouseholdShares, useDeleteEventShare } from "@/hooks/useSharing";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

const Settings = () => {
  const session = getSession();
  const navigate = useNavigate();
  
  const [householdName, setHouseholdName] = useState(session?.householdName || "");
  
  const { data: preferences, isLoading } = usePreferences(session?.householdCode || "");
  const updatePreferences = useUpdatePreferences();
  const { data: sharedEvents = [] } = useHouseholdShares(session?.householdCode || "");
  const deleteSharedEvent = useDeleteEventShare();

  if (!session) {
    navigate("/");
    return null;
  }

  const handlePreferenceChange = (key: keyof Preferences, value: any) => {
    if (!preferences) return;
    
    updatePreferences.mutate(
      { householdCode: session.householdCode, preferences: { [key]: value } },
      {
        onSuccess: () => toast.success("Inställning sparad"),
        onError: () => toast.error("Kunde inte spara inställningen"),
      }
    );
  };

  const handleSaveHouseholdName = () => {
    if (householdName.trim()) {
      updateHouseholdName(householdName.trim());
      toast.success("Hushållsnamn uppdaterat");
    }
  };

  const handleRevokeShare = (id: string) => {
    deleteSharedEvent.mutate({ id }, {
      onSuccess: () => toast.success("Delningslänk borttagen"),
      onError: () => toast.error("Kunde inte ta bort länken"),
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Inställningar</h1>
            <p className="text-muted-foreground">Anpassa din familjekalender</p>
          </div>
        </div>

        <Tabs defaultValue="household" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-1">
            <TabsTrigger value="household" className="flex flex-col gap-1 py-2">
              <Home className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Hushåll</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col gap-1 py-2">
              <Bell className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Aviseringar</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex flex-col gap-1 py-2">
              <Palette className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Tema</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex flex-col gap-1 py-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Kalender</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex flex-col gap-1 py-2">
              <Brain className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex flex-col gap-1 py-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Sekretess</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex flex-col gap-1 py-2">
              <Info className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Om</span>
            </TabsTrigger>
          </TabsList>

          {/* Household Settings */}
          <TabsContent value="household" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hushållsinställningar</CardTitle>
                <CardDescription>Hantera ditt hushåll</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="householdName">Hushållsnamn</Label>
                  <div className="flex gap-2">
                    <Input
                      id="householdName"
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      placeholder="T.ex. Familjen Andersson"
                    />
                    <Button onClick={handleSaveHouseholdName}>Spara</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Hushållskod</Label>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 bg-muted rounded-lg text-sm font-mono">
                      {session.householdCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(session.householdCode);
                        toast.success("Kopierad till urklipp");
                      }}
                    >
                      Kopiera
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dela denna kod för att låta andra gå med i ditt hushåll
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aviseringar</CardTitle>
                <CardDescription>Hantera dina aviseringsinställningar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ) : preferences && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Aktivera aviseringar</Label>
                        <p className="text-sm text-muted-foreground">
                          Ta emot påminnelser för händelser och uppgifter
                        </p>
                      </div>
                      <Switch
                        checked={preferences.notifications_enabled}
                        onCheckedChange={(v) => handlePreferenceChange("notifications_enabled", v)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utseende</CardTitle>
                <CardDescription>Anpassa appens utseende</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ) : preferences && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Automatiska säsongsteman</Label>
                        <p className="text-sm text-muted-foreground">
                          Ändra tema baserat på årstid
                        </p>
                      </div>
                      <Switch
                        checked={preferences.theme_auto}
                        onCheckedChange={(v) => handlePreferenceChange("theme_auto", v)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Mörkt läge</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "light", label: "Ljust", icon: Sun },
                          { value: "dark", label: "Mörkt", icon: Moon },
                          { value: "auto", label: "Auto", icon: Monitor },
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => handlePreferenceChange("dark_mode", value)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                              preferences.dark_mode === value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Settings */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kalenderinställningar</CardTitle>
                <CardDescription>Anpassa hur kalendern visas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ) : preferences && (
                  <>
                    <div className="space-y-2">
                      <Label>Standardvy</Label>
                      <Select
                        value={preferences.calendar_view}
                        onValueChange={(v) => handlePreferenceChange("calendar_view", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="month">Månad</SelectItem>
                          <SelectItem value="week">Vecka</SelectItem>
                          <SelectItem value="day">Dag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Första dag i veckan</Label>
                      <Select
                        value={String(preferences.start_of_week)}
                        onValueChange={(v) => handlePreferenceChange("start_of_week", Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="1">Måndag</SelectItem>
                          <SelectItem value="0">Söndag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tidsformat</Label>
                      <Select
                        value={preferences.time_format}
                        onValueChange={(v) => handlePreferenceChange("time_format", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="24h">24-timmar (14:00)</SelectItem>
                          <SelectItem value="12h">12-timmar (2:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Datumformat</Label>
                      <Select
                        value={preferences.date_format}
                        onValueChange={(v) => handlePreferenceChange("date_format", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="YYYY-MM-DD">2025-12-25</SelectItem>
                          <SelectItem value="DD/MM/YYYY">25/12/2025</SelectItem>
                          <SelectItem value="MM/DD/YYYY">12/25/2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Standardlängd för händelser (minuter)</Label>
                      <Select
                        value={String(preferences.default_event_duration)}
                        onValueChange={(v) => handlePreferenceChange("default_event_duration", Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="30">30 minuter</SelectItem>
                          <SelectItem value="60">1 timme</SelectItem>
                          <SelectItem value="90">1,5 timmar</SelectItem>
                          <SelectItem value="120">2 timmar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-inställningar</CardTitle>
                <CardDescription>Hantera AI-funktioner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ) : preferences && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Aktivera AI-funktioner</Label>
                        <p className="text-sm text-muted-foreground">
                          Smart sökning, kategorisering och förslag
                        </p>
                      </div>
                      <Switch
                        checked={preferences.ai_enabled}
                        onCheckedChange={(v) => handlePreferenceChange("ai_enabled", v)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sekretess & Säkerhet</CardTitle>
                <CardDescription>Hantera delningar och aktivitet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Aktiva delningslänkar</Label>
                  {sharedEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inga aktiva delningar</p>
                  ) : (
                    <div className="space-y-2">
                      {sharedEvents.map((share: any) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">Delad händelse</p>
                            <p className="text-xs text-muted-foreground">
                              Skapad {format(new Date(share.created_at), "d MMM yyyy", { locale: sv })}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeShare(share.id)}
                          >
                            Ta bort
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Om Familjekalendern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono">1.0.0</span>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    Familjekalendern hjälper dig att planera och organisera familjens
                    händelser, recept, inköp och uppgifter på ett enkelt sätt.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href="mailto:support@example.com">
                      Feedback & Support
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
