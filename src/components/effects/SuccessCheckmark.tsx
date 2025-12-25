import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessCheckmarkProps {
  show: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
};

const iconSizes = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

export function SuccessCheckmark({ show, size = "md", className }: SuccessCheckmarkProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-full bg-success flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
      >
        <Check className={cn("text-success-foreground", iconSizes[size])} strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

// Toast-like success notification
export function SuccessToast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success text-success-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
    >
      <Check className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}
