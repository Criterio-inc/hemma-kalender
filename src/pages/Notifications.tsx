import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { Bell, Calendar, CheckCircle2, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, Notification } from "@/hooks/useNotifications";
import { getSession } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "event_reminder":
    case "event_upcoming":
    case "event_today":
      return <Calendar className="w-5 h-5 text-primary" />;
    case "todo_due":
      return <CheckCircle2 className="w-5 h-5 text-accent" />;
    case "collaboration":
      return <MessageSquare className="w-5 h-5 text-secondary-foreground" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

const Notifications = () => {
  const session = getSession();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: notifications = [], isLoading } = useNotifications(session?.householdCode || "");
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (!session) {
    navigate("/");
    return null;
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (typeFilter !== "all" && n.notification_type !== typeFilter) return false;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    
    if (notification.event_id) {
      navigate("/calendar");
    } else if (notification.todo_id) {
      navigate("/todos");
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(session.householdCode);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Aviseringar</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} olästa` : "Alla lästa"}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="w-4 h-4 mr-2" />
              Markera alla som lästa
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="unread">Olästa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Alla typer</SelectItem>
              <SelectItem value="event_reminder">Påminnelser</SelectItem>
              <SelectItem value="todo_due">Uppgifter</SelectItem>
              <SelectItem value="event_today">Händelser idag</SelectItem>
              <SelectItem value="collaboration">Samarbete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Inga aviseringar</h3>
              <p className="text-muted-foreground text-sm">
                {filter === "unread" 
                  ? "Du har inga olästa aviseringar"
                  : "Du har inga aviseringar ännu"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  !notification.read && "bg-primary/5 border-primary/20"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: sv,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Notifications;
