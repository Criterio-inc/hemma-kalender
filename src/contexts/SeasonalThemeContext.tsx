import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const SeasonalThemeContext = createContext<SeasonalThemeContextType | undefined>(undefined);

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState(new Date().getMonth());

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

  const theme = monthThemes[month];
  const seasonalClass = `season-${theme}`;

  return (
    <SeasonalThemeContext.Provider value={{ theme, month, seasonalClass }}>
      <div className={`${seasonalClass} transition-colors duration-1000`}>
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
