import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChefHat,
  ListTodo,
  StickyNote,
  ShoppingCart,
  Users,
  Image,
  Link as LinkIcon,
  Bell,
  Sparkles,
} from "lucide-react";

interface EmptyStateProps {
  type: "events" | "recipes" | "todos" | "notes" | "shopping" | "guests" | "images" | "links" | "notifications" | "custom";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const iconMap = {
  events: Calendar,
  recipes: ChefHat,
  todos: ListTodo,
  notes: StickyNote,
  shopping: ShoppingCart,
  guests: Users,
  images: Image,
  links: LinkIcon,
  notifications: Bell,
  custom: Sparkles,
};

const defaultMessages = {
  events: {
    title: "Inga händelser än",
    description: "Lägg till din första händelse för att komma igång!",
    actionLabel: "Lägg till händelse",
  },
  recipes: {
    title: "Inga recept än",
    description: "Börja din receptbank med ditt första recept!",
    actionLabel: "Lägg till recept",
  },
  todos: {
    title: "Inga uppgifter",
    description: "Bra jobbat! Du har inga uppgifter kvar.",
    actionLabel: "Lägg till uppgift",
  },
  notes: {
    title: "Inga anteckningar än",
    description: "Lägg till anteckningar för att spara viktiga detaljer.",
    actionLabel: "Lägg till anteckning",
  },
  shopping: {
    title: "Tom inköpslista",
    description: "Lägg till varor för att börja handla.",
    actionLabel: "Lägg till vara",
  },
  guests: {
    title: "Inga gäster än",
    description: "Lägg till gäster för att hantera inbjudningar.",
    actionLabel: "Lägg till gäst",
  },
  images: {
    title: "Inga bilder än",
    description: "Lägg till bilder för att dokumentera minnen.",
    actionLabel: "Ladda upp bild",
  },
  links: {
    title: "Inga länkar än",
    description: "Spara användbara länkar här.",
    actionLabel: "Lägg till länk",
  },
  notifications: {
    title: "Inga aviseringar",
    description: "Du är helt uppdaterad!",
    actionLabel: "",
  },
  custom: {
    title: "Inget att visa",
    description: "Det finns inget innehåll här än.",
    actionLabel: "Lägg till",
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[type];
  const defaults = defaultMessages[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3, type: "spring" }}
        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        {icon || <Icon className="w-10 h-10 text-muted-foreground" />}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {title || defaults.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-xs mb-6"
      >
        {description || defaults.description}
      </motion.p>

      {(actionLabel || defaults.actionLabel) && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} variant="default" size="lg">
            {actionLabel || defaults.actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
