import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { EventCategory, getEventTheme } from "@/themes/eventThemes";

// Month index (0-11) mapped to theme names
const monthThemes = [
  "vintervit",      // January
  "vintersport",    // February
  "tidig-var",      // March
  "varblomning",    // April
  "gronska",        // May
  "midsommar",      // June
  "hogsommar",      // July
  "sensommar",      // August
  "hostfarger",     // September
  "hostlov",        // October
  "mork-host",      // November
  "jul",            // December
] as const;

export type SeasonalTheme = typeof monthThemes[number];

interface SeasonalThemeContextType {
  theme: SeasonalTheme;
  month: number;
  seasonalClass: string;
  eventThemeClass: string | null;
  eventCategory: EventCategory | null;
  setEventTheme: (category: EventCategory | null) => void;
  isEventThemeActive: boolean;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextType | undefined>(undefined);

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [eventCategory, setEventCategory] = useState<EventCategory | null>(null);

  useEffect(() => {
    // Check for month change every minute
    const interval = setInterval(() => {
      const currentMonth = new Date().getMonth();
      if (currentMonth !== month) {
        setMonth(currentMonth);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [month]);

  const setEventTheme = useCallback((category: EventCategory | null) => {
    setEventCategory(category);
  }, []);

  const theme = monthThemes[month];
  const seasonalClass = `season-${theme}`;
  const eventTheme = eventCategory ? getEventTheme(eventCategory) : null;
  const eventThemeClass = eventTheme?.cssClass || null;
  const isEventThemeActive = !!eventCategory;

  // Determine which class to apply - event theme takes priority
  const activeClass = eventThemeClass || seasonalClass;

  return (
    <SeasonalThemeContext.Provider value={{ 
      theme, 
      month, 
      seasonalClass, 
      eventThemeClass,
      eventCategory,
      setEventTheme,
      isEventThemeActive
    }}>
      <div className={`${activeClass} transition-colors duration-500`}>
        {children}
      </div>
    </SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme() {
  const context = useContext(SeasonalThemeContext);
  if (context === undefined) {
    throw new Error("useSeasonalTheme must be used within a SeasonalThemeProvider");
  }
  return context;
}

// Helper to get season name in Swedish
export function getSeasonName(month: number): string {
  const names = [
    "Vintervit",
    "Vintersport",
    "Tidig Vår",
    "Vårblomning",
    "Grönska",
    "Sommar & Midsommar",
    "Högsommar",
    "Sensommar",
    "Höstfärger",
    "Höstlov",
    "Mörk Höst",
    "Advent & Jul",
  ];
  return names[month] || "Familjekalendern";
}
