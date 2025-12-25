import { useSeasonalTheme } from "@/contexts/SeasonalThemeContext";
import { useMemo } from "react";

const SeasonalDecorations = () => {
  const { month } = useSeasonalTheme();

  const decorations = useMemo(() => {
    // Winter months (Dec, Jan, Feb) - Snowflakes
    if (month === 11 || month === 0 || month === 1) {
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-primary/20 animate-snowfall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 6}s`,
                fontSize: `${10 + Math.random() * 14}px`,
              }}
            >
              ❄
            </div>
          ))}
        </div>
      );
    }

    // Spring months (Mar, Apr, May) - Flowers
    if (month >= 2 && month <= 4) {
      const flowers = month === 3 ? ["🌸", "🌷", "🦋"] : ["🌱", "🌿", "🍀"];
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-up"
              style={{
                left: `${10 + Math.random() * 80}%`,
                bottom: `${Math.random() * 30}%`,
                animationDelay: `${Math.random() * 4}s`,
                fontSize: `${12 + Math.random() * 10}px`,
                opacity: 0.4,
              }}
            >
              {flowers[Math.floor(Math.random() * flowers.length)]}
            </div>
          ))}
        </div>
      );
    }

    // Summer months (Jun, Jul, Aug) - Sun rays or waves
    if (month >= 5 && month <= 7) {
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-10"
            style={{
              background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
            }}
          />
          {month === 5 && (
            // Midsommar decorations
            <div className="absolute bottom-0 left-0 right-0 flex justify-around opacity-20">
              {["🌻", "🌼", "🌺"].map((flower, i) => (
                <span key={i} className="text-2xl animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {flower}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Autumn months (Sep, Oct, Nov) - Falling leaves
    if (month >= 8 && month <= 10) {
      const leaves = month === 9 ? ["🎃", "🍂", "🍁"] : ["🍂", "🍁", "🌰"];
      return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-leaf-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${10 + Math.random() * 8}s`,
                fontSize: `${14 + Math.random() * 12}px`,
                opacity: 0.3,
              }}
            >
              {leaves[Math.floor(Math.random() * leaves.length)]}
            </div>
          ))}
        </div>
      );
    }

    return null;
  }, [month]);

  return decorations;
};

export default SeasonalDecorations;
