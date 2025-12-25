import { useEffect, useState } from "react";
import { EventCategory } from "@/themes/eventThemes";
import { cn } from "@/lib/utils";

interface EventDecorationsProps {
  category: EventCategory;
  className?: string;
}

// SVG decoration elements for each theme
const ChristmasDecorations = () => (
  <>
    {/* Snowflakes */}
    {[...Array(8)].map((_, i) => (
      <div
        key={`snow-${i}`}
        className="absolute animate-snowfall opacity-60"
        style={{
          left: `${10 + i * 12}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${4 + i * 0.5}s`,
        }}
      >
        <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 8L22 12L14 16L12 24L10 16L2 12L10 8L12 0Z" />
        </svg>
      </div>
    ))}
    {/* Christmas lights */}
    <div className="absolute top-0 left-0 right-0 h-6 flex justify-around">
      {[...Array(12)].map((_, i) => (
        <div
          key={`light-${i}`}
          className={cn(
            "w-2 h-3 rounded-full animate-twinkle",
            i % 3 === 0 ? "bg-red-500" : i % 3 === 1 ? "bg-green-500" : "bg-yellow-400"
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </>
);

const EasterDecorations = () => (
  <>
    {/* Easter eggs */}
    {[...Array(5)].map((_, i) => (
      <div
        key={`egg-${i}`}
        className="absolute animate-float-up opacity-70"
        style={{
          left: `${15 + i * 18}%`,
          bottom: "-20px",
          animationDelay: `${i * 0.7}s`,
        }}
      >
        <div
          className={cn(
            "w-6 h-8 rounded-[50%/60%]",
            i % 4 === 0 ? "bg-pink-300" : i % 4 === 1 ? "bg-yellow-300" : i % 4 === 2 ? "bg-purple-300" : "bg-green-300"
          )}
        />
      </div>
    ))}
    {/* Small flowers */}
    {[...Array(6)].map((_, i) => (
      <div
        key={`flower-${i}`}
        className="absolute text-yellow-400 opacity-50"
        style={{
          left: `${5 + i * 17}%`,
          top: `${70 + (i % 3) * 10}%`,
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="4" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <circle
              key={angle}
              cx={12 + 6 * Math.cos((angle * Math.PI) / 180)}
              cy={12 + 6 * Math.sin((angle * Math.PI) / 180)}
              r="3"
            />
          ))}
        </svg>
      </div>
    ))}
  </>
);

const MidsummerDecorations = () => (
  <>
    {/* Sun rays */}
    <div className="absolute top-4 right-4 opacity-40">
      <div className="w-16 h-16 rounded-full bg-yellow-400 animate-pulse-soft" />
      {[...Array(8)].map((_, i) => (
        <div
          key={`ray-${i}`}
          className="absolute w-1 h-8 bg-yellow-400 origin-bottom"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
          }}
        />
      ))}
    </div>
    {/* Flowers */}
    {[...Array(7)].map((_, i) => (
      <div
        key={`midsummer-flower-${i}`}
        className="absolute animate-sway opacity-60"
        style={{
          left: `${8 + i * 14}%`,
          bottom: "0",
          animationDelay: `${i * 0.3}s`,
        }}
      >
        <svg className="w-8 h-12" viewBox="0 0 32 48">
          <path d="M16 48 L16 24" stroke="hsl(122, 39%, 39%)" strokeWidth="2" />
          <circle cx="16" cy="18" r="6" fill={i % 2 === 0 ? "hsl(199, 92%, 64%)" : "hsl(45, 100%, 69%)"} />
          <circle cx="16" cy="18" r="2" fill="hsl(45, 100%, 50%)" />
        </svg>
      </div>
    ))}
  </>
);

const WeddingDecorations = () => (
  <>
    {/* Hearts and sparkles */}
    {[...Array(6)].map((_, i) => (
      <div
        key={`heart-${i}`}
        className="absolute animate-shimmer opacity-40"
        style={{
          left: `${10 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
          animationDelay: `${i * 0.4}s`,
        }}
      >
        <svg className="w-6 h-6 text-pink-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    ))}
    {/* Gold sparkles */}
    {[...Array(10)].map((_, i) => (
      <div
        key={`sparkle-${i}`}
        className="absolute animate-sparkle opacity-60"
        style={{
          left: `${Math.random() * 90}%`,
          top: `${Math.random() * 80}%`,
          animationDelay: `${i * 0.3}s`,
        }}
      >
        <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 8L22 12L14 16L12 24L10 16L2 12L10 8L12 0Z" />
        </svg>
      </div>
    ))}
  </>
);

const BirthdayDecorations = () => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: string; color: string; delay: string }>>([]);

  useEffect(() => {
    const pieces = [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: ["#f43f5e", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"][Math.floor(Math.random() * 6)],
      delay: `${Math.random() * 2}s`,
    }));
    setConfettiPieces(pieces);
  }, []);

  return (
    <>
      {/* Balloons */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`balloon-${i}`}
          className="absolute animate-float opacity-70"
          style={{
            left: `${10 + i * 20}%`,
            bottom: "0",
            animationDelay: `${i * 0.5}s`,
          }}
        >
          <svg className="w-10 h-16" viewBox="0 0 40 64">
            <ellipse
              cx="20"
              cy="20"
              rx="15"
              ry="18"
              fill={["#f43f5e", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"][i]}
            />
            <path d="M20 38 L20 60" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
            <polygon points="17,36 23,36 20,42" fill={["#f43f5e", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"][i]} />
          </svg>
        </div>
      ))}
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </>
  );
};

const LuciaDecorations = () => (
  <>
    {/* Candles */}
    {[...Array(5)].map((_, i) => (
      <div
        key={`candle-${i}`}
        className="absolute"
        style={{
          left: `${20 + i * 15}%`,
          top: "10%",
        }}
      >
        <div className="w-1 h-8 bg-white rounded-full" />
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="w-2 h-4 bg-yellow-400 rounded-full animate-flicker opacity-90" />
          <div className="w-1 h-2 bg-orange-400 rounded-full absolute top-1 left-1/2 -translate-x-1/2 animate-flicker" style={{ animationDelay: "0.1s" }} />
        </div>
      </div>
    ))}
    {/* Stars */}
    {[...Array(8)].map((_, i) => (
      <div
        key={`star-${i}`}
        className="absolute text-yellow-400 animate-twinkle opacity-50"
        style={{
          left: `${5 + i * 12}%`,
          top: `${30 + (i % 4) * 15}%`,
          animationDelay: `${i * 0.2}s`,
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 8L22 12L14 16L12 24L10 16L2 12L10 8L12 0Z" />
        </svg>
      </div>
    ))}
  </>
);

const NewYearDecorations = () => (
  <>
    {/* Fireworks */}
    {[...Array(4)].map((_, i) => (
      <div
        key={`firework-${i}`}
        className="absolute animate-firework"
        style={{
          left: `${15 + i * 22}%`,
          top: `${10 + (i % 2) * 15}%`,
          animationDelay: `${i * 0.8}s`,
        }}
      >
        {[...Array(8)].map((_, j) => (
          <div
            key={j}
            className="absolute w-1 h-4 origin-bottom"
            style={{
              background: `linear-gradient(to top, ${["#ffd700", "#ff6b6b", "#4ecdc4", "#a855f7"][i % 4]}, transparent)`,
              transform: `rotate(${j * 45}deg)`,
            }}
          />
        ))}
      </div>
    ))}
    {/* Gold sparkles */}
    {[...Array(15)].map((_, i) => (
      <div
        key={`gold-${i}`}
        className="absolute animate-sparkle"
        style={{
          left: `${Math.random() * 90}%`,
          top: `${Math.random() * 70}%`,
          animationDelay: `${i * 0.2}s`,
        }}
      >
        <div className="w-1 h-1 rounded-full bg-yellow-400" />
      </div>
    ))}
  </>
);

const SummerDecorations = () => (
  <>
    {/* Waves */}
    <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden opacity-30">
      <div className="absolute bottom-0 w-[200%] h-8 bg-cyan-400 animate-wave" style={{ borderRadius: "50% 50% 0 0" }} />
      <div className="absolute bottom-2 w-[200%] h-6 bg-cyan-300 animate-wave" style={{ borderRadius: "50% 50% 0 0", animationDelay: "0.5s" }} />
    </div>
    {/* Sun */}
    <div className="absolute top-4 right-8 opacity-50">
      <div className="w-12 h-12 rounded-full bg-yellow-400 animate-pulse-soft" />
    </div>
  </>
);

const SportlovDecorations = () => (
  <>
    {/* Mountains */}
    <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20">
      <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <polygon points="0,100 50,30 100,100" fill="hsl(213, 71%, 49%)" />
        <polygon points="60,100 120,20 180,100" fill="hsl(213, 71%, 39%)" />
        <polygon points="150,100 220,25 290,100" fill="hsl(213, 71%, 49%)" />
        <polygon points="250,100 320,35 400,100" fill="hsl(213, 71%, 39%)" />
      </svg>
    </div>
    {/* Snowflakes */}
    {[...Array(6)].map((_, i) => (
      <div
        key={`sport-snow-${i}`}
        className="absolute animate-snowfall opacity-40"
        style={{
          left: `${15 + i * 14}%`,
          animationDelay: `${i * 0.4}s`,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    ))}
  </>
);

const decorationComponents: Record<EventCategory, React.FC | null> = {
  christmas: ChristmasDecorations,
  easter: EasterDecorations,
  midsummer: MidsummerDecorations,
  wedding: WeddingDecorations,
  birthday: BirthdayDecorations,
  lucia: LuciaDecorations,
  new_year: NewYearDecorations,
  summer_vacation: SummerDecorations,
  sportlov: SportlovDecorations,
  graduation: null,
  anniversary: WeddingDecorations, // Similar to wedding
  custom: null,
};

export const EventDecorations = ({ category, className }: EventDecorationsProps) => {
  const DecorationComponent = decorationComponents[category];

  if (!DecorationComponent) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      <DecorationComponent />
    </div>
  );
};

export default EventDecorations;
