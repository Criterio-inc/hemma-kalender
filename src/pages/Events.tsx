import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO, isSameMonth } from "date-fns";
import { sv } from "date-fns/locale";
import { Search, Filter, Star, Calendar, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";
import { getSession, HouseholdSession } from "@/lib/auth";
import { useEventsForYear, Event } from "@/hooks/useEvents";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import { EventListSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarErrorFallback } from "@/components/errors";

const eventCategories = [
  { value: "all", label: "Alla kategorier" },
  { value: "birthday", label: "Födelsedag" },
  { value: "holiday", label: "Högtid" },
  { value: "school", label: "Skola" },
  { value: "activity", label: "Aktivitet" },
  { value: "appointment", label: "Möte/Tid" },
  { value: "custom", label: "Övrigt" },
];

const Events = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  const currentYear = new Date().getFullYear();
  const { data: events = [], isLoading, error, refetch } = useEventsForYear(
    session?.householdCode || "",
    currentYear
  );

  const handleRetry = () => {
    refetch();
  };

  // Filter and search events
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Search filter
        if (
          searchQuery &&
          !event.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Category filter
        if (categoryFilter !== "all" && event.event_category !== categoryFilter) {
          return false;
        }

        // Type filter
        if (typeFilter !== "all" && event.event_type !== typeFilter) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
  }, [events, searchQuery, categoryFilter, typeFilter]);

  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: Event[] } = {};

    filteredEvents.forEach((event) => {
      const monthKey = format(parseISO(event.start_date), "yyyy-MM");
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });

    return groups;
  }, [filteredEvents]);

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "birthday":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      case "holiday":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "school":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "activity":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "appointment":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!session) return null;

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Händelser
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök händelser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {eventCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla typer</SelectItem>
              <SelectItem value="simple">Enkel</SelectItem>
              <SelectItem value="major">Stordag</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        {isLoading ? (
          <EventListSkeleton count={5} />
        ) : error ? (
          <CalendarErrorFallback 
            message="Kunde inte ladda händelser" 
            onRetry={handleRetry}
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState type="events" />
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.03 } }
            }}
            className="space-y-8"
          >
            {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => (
              <motion.div 
                key={monthKey}
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1 }
                }}
              >
                <h2 className="text-lg font-semibold text-foreground capitalize mb-3 sticky top-16 bg-background py-2 z-10">
                  {format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: sv })}
                </h2>

                <div className="space-y-2">
                  {monthEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {event.event_type === "major" && (
                                  <Star className="w-4 h-4 text-warning fill-warning" />
                                )}
                                <h3 className="font-semibold text-foreground truncate">
                                  {event.title}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(event.start_date), "EEEE d MMMM", {
                                  locale: sv,
                                })}
                                {!event.all_day && (
                                  <>
                                    {" "}
                                    kl{" "}
                                    {format(parseISO(event.start_date), "HH:mm")}
                                  </>
                                )}
                              </p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {event.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                className={getCategoryColor(event.event_category)}
                              >
                                {eventCategories.find(
                                  (c) => c.value === event.event_category
                                )?.label || "Övrigt"}
                              </Badge>
                              {event.all_day && (
                                <Badge variant="outline" className="text-xs">
                                  Heldag
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </AppLayout>
  );
};

export default Events;
