import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  ListTodo,
  BookOpen,
  Image,
  StickyNote,
  Link2,
  CheckCircle2,
  Circle,
  Eye,
  Edit,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useSharedEventByToken,
  useSharedEventData,
} from "@/hooks/useSharing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const categoryLabels: Record<string, string> = {
  birthday: "Födelsedag",
  christmas: "Jul",
  wedding: "Bröllop",
  easter: "Påsk",
  midsummer: "Midsommar",
  lucia: "Lucia",
  new_year: "Nyår",
  summer_vacation: "Sommarlov",
  sportlov: "Sportlov",
  graduation: "Examen",
  anniversary: "Årsdag",
  custom: "Övrigt",
};

const SharedEvent = () => {
  const { token } = useParams<{ token: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useSharedEventByToken(token || "");
  const { data: eventData, refetch: refetchEventData } = useSharedEventData(
    data?.event?.id || "",
    !!data?.event?.id
  );

  // Set up real-time subscription for collaborative updates
  useEffect(() => {
    if (!data?.event?.id) return;

    const channel = supabase
      .channel(`shared-event-${data.event.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `event_id=eq.${data.event.id}`,
        },
        () => {
          refetchEventData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `event_id=eq.${data.event.id}`,
        },
        () => {
          refetchEventData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data?.event?.id, refetchEventData]);

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    if (data?.share.access_level !== "edit") {
      toast.error("Du har inte behörighet att redigera");
      return;
    }

    try {
      const { error } = await supabase
        .from("todos")
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null,
        })
        .eq("id", todoId);

      if (error) throw error;
      refetchEventData();
      toast.success(completed ? "Uppgift markerad som ej klar" : "Uppgift slutförd!");
    } catch (error) {
      toast.error("Kunde inte uppdatera uppgiften");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Laddar delad händelse...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Länken är ogiltig</h1>
          <p className="text-muted-foreground mb-6">
            Den här delningslänken har gått ut eller finns inte längre.
          </p>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Gå till startsidan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { event, share } = data;
  const canEdit = share.access_level === "edit";
  const categoryLabel = categoryLabels[event.event_category || "custom"] || "Övrigt";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{event.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {canEdit ? (
                    <>
                      <Edit className="w-3 h-3 mr-1" />
                      Kan redigera
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Endast visa
                    </>
                  )}
                </Badge>
                <span>•</span>
                <span>Delad händelse</span>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Hem
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-xs">
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              Översikt
            </TabsTrigger>
            <TabsTrigger value="todos" className="text-xs">
              <ListTodo className="w-3.5 h-3.5 mr-1" />
              Att göra
            </TabsTrigger>
            <TabsTrigger value="recipes" className="text-xs">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Recept
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              <Image className="w-3.5 h-3.5 mr-1" />
              Bilder
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <StickyNote className="w-3.5 h-3.5 mr-1" />
              Anteckningar
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="bg-muted/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold capitalize">
                    {format(new Date(event.start_date), "EEEE d MMMM yyyy", {
                      locale: sv,
                    })}
                  </p>
                  {!event.all_day && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(event.start_date), "HH:mm")}
                      {event.end_date && ` - ${format(new Date(event.end_date), "HH:mm")}`}
                    </p>
                  )}
                </div>
              </div>

              <Badge className="mb-4">{categoryLabel}</Badge>

              {event.description && (
                <p className="text-muted-foreground">{event.description}</p>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-xl p-4 border">
                <ListTodo className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold">{eventData?.todos?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Uppgifter</p>
              </div>
              <div className="bg-background rounded-xl p-4 border">
                <BookOpen className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold">{eventData?.recipes?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Recept</p>
              </div>
              <div className="bg-background rounded-xl p-4 border">
                <Image className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold">{eventData?.images?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Bilder</p>
              </div>
              <div className="bg-background rounded-xl p-4 border">
                <StickyNote className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold">{eventData?.notes?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Anteckningar</p>
              </div>
            </div>
          </TabsContent>

          {/* Todos */}
          <TabsContent value="todos" className="mt-6">
            <div className="space-y-2">
              {eventData?.todos?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inga uppgifter ännu</p>
                </div>
              ) : (
                eventData?.todos?.map((todo: any) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                      todo.completed ? "bg-muted/50" : "bg-background"
                    )}
                  >
                    {canEdit ? (
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                      />
                    ) : todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className={cn(todo.completed && "line-through text-muted-foreground")}>
                        {todo.title}
                      </p>
                      {todo.due_date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(todo.due_date), "d MMM", { locale: sv })}
                        </p>
                      )}
                    </div>
                    {todo.priority === "high" && (
                      <Badge variant="destructive" className="text-xs">Hög</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Recipes */}
          <TabsContent value="recipes" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {eventData?.recipes?.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inga recept ännu</p>
                </div>
              ) : (
                eventData?.recipes?.map((item: any) => (
                  <div key={item.id} className="bg-background rounded-xl border p-4">
                    {item.recipes?.image_url && (
                      <img
                        src={item.recipes.image_url}
                        alt={item.recipes.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold">{item.recipes?.title}</h3>
                    {item.recipes?.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.recipes.description}
                      </p>
                    )}
                    {item.meal_type && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {item.meal_type}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="mt-6">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {eventData?.images?.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inga bilder ännu</p>
                </div>
              ) : (
                eventData?.images?.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.caption || "Bild"}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {image.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
                        <p className="text-white text-sm">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="mt-6">
            <div className="space-y-4">
              {eventData?.notes?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inga anteckningar ännu</p>
                </div>
              ) : (
                eventData?.notes?.map((note: any) => (
                  <div key={note.id} className="bg-background rounded-xl border p-4">
                    {note.title && (
                      <h3 className="font-semibold mb-2">{note.title}</h3>
                    )}
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {format(new Date(note.created_at), "d MMM yyyy", { locale: sv })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SharedEvent;
