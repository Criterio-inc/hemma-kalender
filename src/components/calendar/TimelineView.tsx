import { differenceInWeeks, differenceInDays } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { TimelinePhase } from "@/hooks/useTimeline";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  phases: TimelinePhase[];
  eventDate: Date;
}

const TimelineView = ({ phases, eventDate }: TimelineViewProps) => {
  const today = new Date();
  const weeksUntilEvent = differenceInWeeks(eventDate, today);
  const daysUntilEvent = differenceInDays(eventDate, today);

  const getPhaseStatus = (weeksBeforeEvent: number) => {
    if (weeksUntilEvent < weeksBeforeEvent) {
      return "completed";
    } else if (weeksUntilEvent === weeksBeforeEvent) {
      return "current";
    }
    return "upcoming";
  };

  const sortedPhases = [...phases].sort((a, b) => b.weeks_before - a.weeks_before);

  if (phases.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">Inga tidslinjefaser skapade</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Countdown */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Tid kvar</p>
        <div className="text-4xl font-display font-bold text-foreground">
          {daysUntilEvent > 0 ? (
            <>
              {daysUntilEvent} <span className="text-lg font-normal text-muted-foreground">dagar</span>
            </>
          ) : daysUntilEvent === 0 ? (
            <span className="text-accent">Idag!</span>
          ) : (
            <span className="text-muted-foreground">Passerat</span>
          )}
        </div>
        {weeksUntilEvent > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            ({weeksUntilEvent} veckor)
          </p>
        )}
      </div>

      {/* Mobile: Vertical timeline */}
      <div className="md:hidden space-y-0">
        {sortedPhases.map((phase, index) => {
          const status = getPhaseStatus(phase.weeks_before);
          const isLast = index === sortedPhases.length - 1;

          return (
            <div key={phase.id} className="relative flex gap-4">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)]",
                    status === "completed" ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Status icon */}
              <div className="relative z-10 flex-shrink-0">
                {status === "completed" ? (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                ) : status === "current" ? (
                  <div className="w-8 h-8 rounded-full border-4 border-accent bg-accent/20 animate-pulse" />
                ) : (
                  <Circle className="w-8 h-8 text-muted-foreground/30" />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "flex-1 pb-6 transition-opacity",
                  status === "upcoming" && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{phase.phase_name}</h4>
                  {status === "current" && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                      Nu
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {phase.weeks_before} veckor före
                </p>
                {phase.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {phase.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Event day */}
        <div className="relative flex gap-4">
          <div className="relative z-10 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">🎉</span>
            </div>
          </div>
          <div className="flex-1 pb-6">
            <h4 className="font-semibold text-foreground">Dagen är här!</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Dags att fira
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Timeline bar */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-border rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    ((sortedPhases[0]?.weeks_before || 8) - weeksUntilEvent) /
                      (sortedPhases[0]?.weeks_before || 8) *
                      100
                  )
                )}%`,
              }}
            />
          </div>

          {/* Phase points */}
          <div className="flex justify-between">
            {sortedPhases.map((phase) => {
              const status = getPhaseStatus(phase.weeks_before);

              return (
                <div
                  key={phase.id}
                  className={cn(
                    "flex flex-col items-center transition-opacity",
                    status === "upcoming" && "opacity-50"
                  )}
                  style={{ width: `${100 / (sortedPhases.length + 1)}%` }}
                >
                  {/* Point */}
                  <div className="relative z-10">
                    {status === "completed" ? (
                      <CheckCircle2 className="w-8 h-8 text-primary bg-background rounded-full" />
                    ) : status === "current" ? (
                      <div className="w-8 h-8 rounded-full border-4 border-accent bg-accent/20 animate-pulse" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-4 border-border bg-background" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <h4 className="font-semibold text-sm text-foreground">
                      {phase.phase_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {phase.weeks_before}v kvar
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Event day point */}
            <div
              className="flex flex-col items-center"
              style={{ width: `${100 / (sortedPhases.length + 1)}%` }}
            >
              <div className="relative z-10">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-sm">🎉</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <h4 className="font-semibold text-sm text-foreground">Dagen!</h4>
                <p className="text-xs text-muted-foreground">Dags att fira</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
