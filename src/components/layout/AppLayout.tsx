import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, HouseholdSession } from "@/lib/auth";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
  onAddEvent?: () => void;
  showHeader?: boolean;
}

const AppLayout = ({ children, onAddEvent, showHeader = true }: AppLayoutProps) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HouseholdSession | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate("/");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Header */}
        {showHeader && <AppHeader session={session} onAddEvent={onAddEvent} />}

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
