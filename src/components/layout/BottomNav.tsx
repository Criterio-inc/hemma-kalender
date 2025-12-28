import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Star, ChefHat, UtensilsCrossed, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Kalender", icon: Calendar, path: "/calendar" },
  { label: "Händelser", icon: Star, path: "/events" },
  { label: "Recept", icon: ChefHat, path: "/recipes" },
  { label: "Matsedel", icon: UtensilsCrossed, path: "/meal-plan" },
  { label: "Mer", icon: Menu, path: "/menu" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden"
      role="navigation"
      aria-label="Mobilnavigering"
    >
      <div className="flex items-center justify-around h-16 px-2" role="list">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors touch-target touch-manipulation focus-visible-ring",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Gå till ${item.label}`}
              role="listitem"
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
