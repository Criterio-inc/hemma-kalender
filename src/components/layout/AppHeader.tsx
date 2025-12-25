import { useNavigate } from "react-router-dom";
import { Calendar, Bell, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HouseholdSession, logout } from "@/lib/auth";
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  session: HouseholdSession;
  onAddEvent?: () => void;
}

const AppHeader = ({ session, onAddEvent }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications(session.householdCode);
  const { data: unreadCount = 0 } = useUnreadNotificationCount(session.householdCode);
  const markRead = useMarkNotificationRead();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNotificationClick = (notification: {
    id: string;
    event_id: string | null;
    todo_id: string | null;
    read: boolean;
  }) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    
    if (notification.event_id) {
      navigate("/calendar");
    } else if (notification.todo_id) {
      navigate("/todos");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and app name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/calendar")}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                  Familjekalendern
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.householdName}
                </p>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 border-b border-border">
                  <h3 className="font-semibold text-sm">Aviseringar</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Inga aviseringar
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-3 cursor-pointer",
                          !notification.read && "bg-primary/5"
                        )}
                      >
                        <p className="text-sm font-medium">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), "d MMM HH:mm", {
                            locale: sv,
                          })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() => navigate("/notifications")}
                      className="text-center text-primary text-sm py-2"
                    >
                      Visa alla
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Event */}
            {onAddEvent && (
              <Button
                variant="hero"
                size="sm"
                onClick={onAddEvent}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ny händelse</span>
              </Button>
            )}

            {/* Logout */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
