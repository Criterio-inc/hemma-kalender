import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Star,
  ChefHat,
  ShoppingCart,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "familjekalendern_onboarding_complete";

const steps = [
  {
    icon: Calendar,
    title: "Välkommen till Familjekalendern!",
    description:
      "En app för att planera och organisera familjens händelser tillsammans. Låt oss visa dig runt!",
    color: "bg-blue-500",
  },
  {
    icon: Star,
    title: "Skapa händelser",
    description:
      "Lägg till födelsedagar, högtider och vardagshändelser. För större events kan du lägga till gästlista, budget och tidslinje.",
    color: "bg-amber-500",
  },
  {
    icon: ChefHat,
    title: "Spara recept",
    description:
      "Samla familjerecept på ett ställe. Lägg till bilder, ingredienser och koppla dem till händelser.",
    color: "bg-green-500",
  },
  {
    icon: ShoppingCart,
    title: "Inköpslistor",
    description:
      "Skapa listor manuellt eller generera automatiskt från recept. Allt synkas i realtid.",
    color: "bg-purple-500",
  },
  {
    icon: CheckSquare,
    title: "Uppgifter & påminnelser",
    description:
      "Håll koll på att-göra med deadlines och påminnelser. Glöm aldrig en viktig uppgift igen!",
    color: "bg-rose-500",
  },
];

interface WelcomeModalProps {
  forceShow?: boolean;
  onClose?: () => void;
}

const WelcomeModal = ({ forceShow = false, onClose }: WelcomeModalProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setOpen(true);
      setCurrentStep(0);
      return;
    }

    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setOpen(true);
    }
  }, [forceShow]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
    onClose?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleComplete();
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 pt-8"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handlePrev} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Tillbaka
                  </Button>
                )}
                <Button onClick={handleNext} className="flex-1">
                  {currentStep === steps.length - 1 ? (
                    "Kom igång!"
                  ) : (
                    <>
                      Nästa
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip link */}
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
                >
                  Hoppa över
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
