import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  type?: "error" | "offline" | "server";
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig = {
  error: {
    icon: AlertTriangle,
    title: "Något gick fel",
    message: "Ett oväntat fel uppstod. Försök igen.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  offline: {
    icon: WifiOff,
    title: "Ingen internetanslutning",
    message: "Kontrollera din anslutning och försök igen.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  server: {
    icon: ServerCrash,
    title: "Serverfel",
    message: "Servern svarar inte. Försök igen senare.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

export function ErrorState({
  type = "error",
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", config.bgColor)}
      >
        <Icon className={cn("w-8 h-8", config.color)} />
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.title}
      </h3>

      <p className="text-muted-foreground max-w-sm mb-6">
        {message || config.message}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Försök igen
        </Button>
      )}
    </motion.div>
  );
}

// Inline error message with shake animation
export function InlineError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500 }}
      className="text-sm text-destructive flex items-center gap-1.5 mt-1"
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      {message}
    </motion.p>
  );
}
