import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeasonalThemeProvider } from "@/contexts/SeasonalThemeContext";
import SeasonalDecorations from "@/components/seasonal/SeasonalDecorations";
import WelcomeModal from "@/components/onboarding/WelcomeModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { 
  PageLoadingSkeleton, 
  CalendarLoadingSkeleton, 
  MealPlanLoadingSkeleton,
  EventsLoadingSkeleton 
} from "@/components/ui/page-loading-skeleton";

// Eagerly loaded pages (login, menu - lightweight)
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";

// Lazy loaded heavy pages
const Calendar = lazy(() => import("./pages/Calendar"));
const Todos = lazy(() => import("./pages/Todos"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const ShoppingLists = lazy(() => import("./pages/ShoppingLists"));
const MealPlan = lazy(() => import("./pages/MealPlan"));
const Events = lazy(() => import("./pages/Events"));
const SharedEvent = lazy(() => import("./pages/SharedEvent"));
const SharedRecipe = lazy(() => import("./pages/SharedRecipe"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));

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
                    <Suspense fallback={<CalendarLoadingSkeleton />}>
                      <Calendar />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/events"
                element={
                  <ErrorBoundary context="events">
                    <Suspense fallback={<EventsLoadingSkeleton />}>
                      <Events />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/todos"
                element={
                  <ErrorBoundary context="todos">
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <Todos />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/recipes"
                element={
                  <ErrorBoundary context="recipes">
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <Recipes />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/recipe/:id"
                element={
                  <ErrorBoundary context="recipes">
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <RecipeDetail />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/shopping"
                element={
                  <ErrorBoundary context="shopping">
                    <Suspense fallback={<PageLoadingSkeleton />}>
                      <ShoppingLists />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/meal-plan"
                element={
                  <ErrorBoundary context="meal-plan">
                    <Suspense fallback={<MealPlanLoadingSkeleton />}>
                      <MealPlan />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route path="/menu" element={<Menu />} />
              <Route 
                path="/shared/:token" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <SharedEvent />
                  </Suspense>
                } 
              />
              <Route 
                path="/shared/recipe/:token" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <SharedRecipe />
                  </Suspense>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <Notifications />
                  </Suspense>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <Settings />
                  </Suspense>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <Help />
                  </Suspense>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <About />
                  </Suspense>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SeasonalThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
