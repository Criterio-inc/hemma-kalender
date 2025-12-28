import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Calendar, CheckCircle2, MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow, isToday, isThisWeek } from "date-fns";
import { sv } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  Notification,
} from "@/hooks/useNotifications";
import { useDeleteNotification } from "@/hooks/useCreateNotification";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  householdCode: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "event_reminder":
    case "event_upcoming":
    case "event_today":
      return <Calendar className="w-4 h-4 text-primary" />;
    case "todo_due":
    case "todo_overdue":
      return <CheckCircle2 className="w-4 h-4 text-accent" />;
    case "collaboration":
      return <MessageSquare className="w-4 h-4 text-secondary-foreground" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

interface GroupedNotifications {
  today: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

const NotificationBell = ({ householdCode }: NotificationBellProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useNotifications(householdCode);
  const { data: unreadCount = 0 } = useUnreadNotificationCount(householdCode);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  // Group notifications
  const grouped: GroupedNotifications = {
    today: [],
    thisWeek: [],
    earlier: [],
  };

  notifications.forEach((n) => {
    const date = new Date(n.created_at);
    if (isToday(date)) {
      grouped.today.push(n);
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      grouped.thisWeek.push(n);
    } else {
      grouped.earlier.push(n);
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }

    setIsOpen(false);

    if (notification.event_id) {
      navigate("/calendar");
    } else if (notification.todo_id) {
      navigate("/todos");
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(householdCode);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const renderNotificationGroup = (
    title: string,
    items: Notification[]
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground px-3 py-1">
          {title}
        </p>
        {items.map((notification) => (
          <button
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "w-full flex items-start gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left group rounded-lg mx-1",
              !notification.read && "bg-primary/5"
            )}
          >
            <div className="mt-0.5">{getNotificationIcon(notification.notification_type)}</div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm line-clamp-2",
                  !notification.read && "font-medium"
                )}
              >
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: sv,
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
              <button
                onClick={(e) => handleDelete(e, notification.id)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
              >
                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Aviseringar</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-7"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Markera alla
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Inga aviseringar</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="p-2 space-y-2">
              {renderNotificationGroup("Idag", grouped.today)}
              {renderNotificationGroup("Denna vecka", grouped.thisWeek)}
              {renderNotificationGroup("Tidigare", grouped.earlier)}
            </div>
          </ScrollArea>
        )}

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
          >
            Visa alla aviseringar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
