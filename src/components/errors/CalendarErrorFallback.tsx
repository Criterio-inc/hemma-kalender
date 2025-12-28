import { motion } from "framer-motion";
import { CalendarX2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarErrorFallbackProps {
  onRetry?: () => void;
  message?: string;
}

export function CalendarErrorFallback({
  onRetry,
  message = "Kunde inte ladda kalendern",
}: CalendarErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
      >
        <CalendarX2 className="w-10 h-10 text-destructive" />
      </motion.div>

      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
        {message}
      </h3>

      <p className="text-muted-foreground max-w-sm mb-6">
        Det gick inte att hämta dina händelser just nu. Kontrollera din
        internetanslutning och försök igen.
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
