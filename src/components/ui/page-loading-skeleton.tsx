import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Search bar skeleton */}
          <Skeleton className="h-10 w-full rounded-lg" />
          
          {/* Filter pills skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="rounded-xl overflow-hidden border border-border">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function CalendarLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* View switcher skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-10 w-64 rounded-full" />
          </div>

          {/* Navigation skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>

          {/* Calendar grid skeleton */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, col) => (
                <Skeleton key={col} className="h-24 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function MealPlanLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, day) => (
            <div key={day} className="space-y-2">
              <Skeleton className="h-8" />
              {Array.from({ length: 3 }).map((_, meal) => (
                <Skeleton key={meal} className="h-24 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function EventsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <Skeleton className="h-8 w-32" />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Event list */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex gap-4 p-4 rounded-xl border border-border">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function SpinnerFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Laddar...</p>
      </motion.div>
    </div>
  );
}
