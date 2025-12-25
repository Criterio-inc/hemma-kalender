import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Settings,
  Bell,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { logout } from "@/lib/auth";
import WelcomeModal from "@/components/onboarding/WelcomeModal";

const menuItems = [
  {
    icon: ShoppingCart,
    label: "Inköpslistor",
    description: "Hantera dina inköpslistor",
    path: "/shopping",
  },
  {
    icon: Bell,
    label: "Aviseringar",
    description: "Visa alla aviseringar",
    path: "/notifications",
  },
  {
    icon: Settings,
    label: "Inställningar",
    description: "Appinställningar och konto",
    path: "/settings",
  },
  {
    icon: HelpCircle,
    label: "Hjälp",
    description: "Vanliga frågor och support",
    path: "/help",
  },
  {
    icon: Info,
    label: "Om appen",
    description: "Version och information",
    path: "/about",
  },
];

const Menu = () => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppLayout showHeader={false}>
      <div className="container max-w-lg mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Mer
        </h1>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <Card
              key={item.path}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}

          {/* Show Guide Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowGuide(true)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Visa guide</h3>
                <p className="text-sm text-muted-foreground">
                  Se introduktionen igen
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        <Button
          variant="outline"
          className="w-full mt-8 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logga ut
        </Button>
      </div>

      {/* Welcome Modal */}
      {showGuide && (
        <WelcomeModal forceShow={true} onClose={() => setShowGuide(false)} />
      )}
    </AppLayout>
  );
};

export default Menu;
