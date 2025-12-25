import { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Download,
  Sparkles,
  BookOpen,
  StickyNote,
  Link2,
  ListTodo,
  DollarSign,
  Users,
  Image,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePreviousYearEvents,
  usePreviousEventData,
  useImportSuggestions,
  useImportData,
} from "@/hooks/useImportFromPrevious";
import { Event } from "@/hooks/useEvents";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImportFromPreviousModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEvent: Event;
  householdCode: string;
}

interface ImportResults {
  recipes: number;
  notes: number;
  links: number;
  todos: number;
  budgetItems: number;
  timelinePhases: number;
  guests: number;
  images: number;
}

const ImportFromPreviousModal = ({
  isOpen,
  onClose,
  targetEvent,
  householdCode,
}: ImportFromPreviousModalProps) => {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [importOptions, setImportOptions] = useState({
    recipes: true,
    notes: true,
    links: true,
    todos: true,
    budgetItems: false,
    timelinePhases: false,
    guests: false,
    images: false,
  });
  const [showResults, setShowResults] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);

  const currentYear = new Date(targetEvent.start_date).getFullYear();
  
  const { data: previousEvents, isLoading: loadingEvents } = usePreviousYearEvents(
    householdCode,
    targetEvent.event_category || ""
  );

  const selectedEventId = previousEvents?.find(e => e.year.toString() === selectedYear)?.event.id || null;
  
  const { data: previousData, isLoading: loadingData } = usePreviousEventData(selectedEventId);
  
  const { getSuggestions, suggestion, isLoading: loadingSuggestions, setSuggestion } = useImportSuggestions();
  
  const importData = useImportData();

  // Filter out current year from previous events
  const availableYears = previousEvents?.filter(e => e.year !== currentYear) || [];

  // Auto-select most recent previous year
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0].year.toString());
    }
  }, [availableYears, selectedYear]);

  // Get AI suggestions when data is loaded
  useEffect(() => {
    if (previousData && !suggestion && !loadingSuggestions) {
      getSuggestions(previousData);
    }
  }, [previousData]);

  const handleImport = async () => {
    if (!previousData || !selectedEventId) {
      toast.error("Välj ett år att importera från");
      return;
    }

    try {
      const results = await importData.mutateAsync({
        targetEventId: targetEvent.id,
        sourceEventId: selectedEventId,
        householdCode,
        importOptions,
        previousData,
        targetEventDate: new Date(targetEvent.start_date),
      });

      setImportResults(results);
      setShowResults(true);
    } catch (error) {
      toast.error("Kunde inte importera data");
    }
  };

  const handleClose = () => {
    setSelectedYear("");
    setImportOptions({
      recipes: true,
      notes: true,
      links: true,
      todos: true,
      budgetItems: false,
      timelinePhases: false,
      guests: false,
      images: false,
    });
    setShowResults(false);
    setImportResults(null);
    setSuggestion(null);
    onClose();
  };

  const toggleOption = (key: keyof typeof importOptions) => {
    setImportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const importOptionsList = [
    { key: "recipes" as const, label: "Recept", icon: BookOpen, count: previousData?.recipes?.length || 0 },
    { key: "notes" as const, label: "Anteckningar", icon: StickyNote, count: previousData?.notes?.length || 0 },
    { key: "links" as const, label: "Länkar", icon: Link2, count: previousData?.links?.length || 0 },
    { key: "todos" as const, label: "Uppgifter", icon: ListTodo, count: previousData?.todos?.length || 0, hint: "Datum justeras automatiskt" },
    { key: "budgetItems" as const, label: "Budget", icon: DollarSign, count: previousData?.budgetItems?.length || 0, hint: "Faktiska kostnader nollställs" },
    { key: "timelinePhases" as const, label: "Tidslinjefaser", icon: Clock, count: previousData?.timelinePhases?.length || 0 },
    { key: "guests" as const, label: "Gästlista", icon: Users, count: previousData?.guests?.length || 0, hint: "RSVP nollställs till väntande" },
    { key: "images" as const, label: "Bilder", icon: Image, count: previousData?.images?.length || 0, hint: "Refererar till befintliga bilder" },
  ];

  if (showResults && importResults) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Import klar!
            </DialogTitle>
            <DialogDescription>
              Data har importerats från {selectedYear} års {targetEvent.event_category}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {Object.entries(importResults).map(([key, count]) => {
              if (count === 0) return null;
              const option = importOptionsList.find(o => o.key === key);
              if (!option) return null;
              const Icon = option.icon;
              return (
                <div key={key} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="flex-1">{option.label}</span>
                  <span className="font-semibold text-primary">{count} importerade</span>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Stäng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Importera från tidigare år
          </DialogTitle>
          <DialogDescription>
            Hämta data från {targetEvent.event_category === "christmas" ? "förra julens" : "förra årets"} planering
          </DialogDescription>
        </DialogHeader>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableYears.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Inga tidigare händelser av denna typ hittades.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Year selector */}
            <div className="space-y-2">
              <Label>Välj år att importera från</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj år..." />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableYears.map(({ year, event }) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} - {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Suggestions */}
            {previousData && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-2">AI-förslag</h4>
                    {loadingSuggestions ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyserar förra årets data...
                      </div>
                    ) : suggestion ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {suggestion}
                      </p>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previousData && getSuggestions(previousData)}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Hämta AI-förslag
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Import options */}
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : previousData ? (
              <div className="space-y-2">
                <Label>Välj vad som ska importeras</Label>
                <div className="space-y-2">
                  {importOptionsList.map((option) => {
                    const Icon = option.icon;
                    const isDisabled = option.count === 0;
                    return (
                      <div
                        key={option.key}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          importOptions[option.key] && !isDisabled
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted/30 border-border",
                          isDisabled && "opacity-50"
                        )}
                      >
                        <Checkbox
                          id={option.key}
                          checked={importOptions[option.key] && !isDisabled}
                          onCheckedChange={() => !isDisabled && toggleOption(option.key)}
                          disabled={isDisabled}
                        />
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <Label
                            htmlFor={option.key}
                            className={cn(
                              "font-normal cursor-pointer",
                              isDisabled && "cursor-not-allowed"
                            )}
                          >
                            {option.label}
                          </Label>
                          {option.hint && (
                            <p className="text-xs text-muted-foreground">{option.hint}</p>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          option.count > 0 ? "text-primary" : "text-muted-foreground"
                        )}>
                          {option.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Avbryt
          </Button>
          <Button
            onClick={handleImport}
            disabled={!previousData || importData.isPending || Object.values(importOptions).every(v => !v)}
          >
            {importData.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importerar...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Importera
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFromPreviousModal;
