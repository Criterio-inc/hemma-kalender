import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeasonalThemeProvider } from "@/contexts/SeasonalThemeContext";
import SeasonalDecorations from "@/components/seasonal/SeasonalDecorations";
import WelcomeModal from "@/components/onboarding/WelcomeModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import Todos from "./pages/Todos";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import ShoppingLists from "./pages/ShoppingLists";
import MealPlan from "./pages/MealPlan";
import Events from "./pages/Events";
import Menu from "./pages/Menu";
import SharedEvent from "./pages/SharedEvent";
import SharedRecipe from "./pages/SharedRecipe";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SeasonalThemeProvider>
          <SeasonalDecorations />
          <Toaster />
          <Sonner position="top-center" richColors />
          <WelcomeModal />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/calendar"
                element={
                  <ErrorBoundary context="calendar">
                    <Calendar />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/events"
                element={
                  <ErrorBoundary context="events">
                    <Events />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/todos"
                element={
                  <ErrorBoundary context="todos">
                    <Todos />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/recipes"
                element={
                  <ErrorBoundary context="recipes">
                    <Recipes />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/recipe/:id"
                element={
                  <ErrorBoundary context="recipes">
                    <RecipeDetail />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/shopping"
                element={
                  <ErrorBoundary context="shopping">
                    <ShoppingLists />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/meal-plan"
                element={
                  <ErrorBoundary context="meal-plan">
                    <MealPlan />
                  </ErrorBoundary>
                }
              />
              <Route path="/menu" element={<Menu />} />
              <Route path="/shared/:token" element={<SharedEvent />} />
              <Route path="/shared/recipe/:token" element={<SharedRecipe />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SeasonalThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
