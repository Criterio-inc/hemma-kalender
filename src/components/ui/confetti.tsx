import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "#FFD700",
  "#FF69B4",
  "#00CED1",
  "#98FB98",
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
  }));
}

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  count?: number;
}

export function Confetti({ trigger, duration = 3000, count = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setPieces(generateConfetti(count));
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, count, duration]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: piece.delay,
                ease: "easeIn",
              }}
              style={{
                position: "absolute",
                width: 10 * piece.scale,
                height: 10 * piece.scale,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger confetti
export function useConfetti() {
  const [trigger, setTrigger] = useState(false);

  const fire = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return { trigger, fire };
}
