import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeasonalThemeProvider } from "@/contexts/SeasonalThemeContext";
import SeasonalDecorations from "@/components/seasonal/SeasonalDecorations";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SeasonalThemeProvider>
        <SeasonalDecorations />
        <Toaster />
        <Sonner position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/events" element={<Events />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/shopping" element={<ShoppingLists />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/shared/:token" element={<SharedEvent />} />
            <Route path="/shared/recipe/:token" element={<SharedRecipe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SeasonalThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
