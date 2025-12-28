import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Star,
  ChefHat,
  UtensilsCrossed,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { label: "Kalender", icon: Calendar, path: "/calendar" },
  { label: "Händelser", icon: Star, path: "/events" },
  { label: "Recept", icon: ChefHat, path: "/recipes" },
  { label: "Matsedel", icon: UtensilsCrossed, path: "/meal-plan" },
  { label: "Inköpslistor", icon: ShoppingCart, path: "/shopping" },
  { label: "Inställningar", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
      role="navigation"
      aria-label="Huvudnavigering"
    >
      {/* Logo area */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <span className="font-display font-bold text-lg text-foreground">
            Familjekalendern
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 touch-target focus-visible-ring"
          aria-label={collapsed ? "Expandera sidopanel" : "Minimera sidopanel"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Huvudmeny">
        <ul className="space-y-1 px-2" role="list">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left touch-target focus-visible-ring touch-manipulation",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
