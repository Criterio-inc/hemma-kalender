import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackUI
          context={this.props.context}
          error={this.state.error}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackUIProps {
  context?: string;
  error: Error | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

function ErrorFallbackUI({
  context,
  error,
  onReset,
  onReload,
  onGoHome,
}: ErrorFallbackUIProps) {
  const getContextualMessage = () => {
    switch (context) {
      case "calendar":
        return "Det uppstod ett fel med kalendern";
      case "recipes":
        return "Det uppstod ett fel med receptsidan";
      case "events":
        return "Det uppstod ett fel med händelserna";
      case "shopping":
        return "Det uppstod ett fel med inköpslistorna";
      case "todos":
        return "Det uppstod ett fel med att-göra-listan";
      case "meal-plan":
        return "Det uppstod ett fel med matschemat";
      default:
        return "Något gick fel";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">
            {getContextualMessage()}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Ett oväntat fel uppstod. Oroa dig inte – dina data är säkra. Försök
            att ladda om sidan eller gå tillbaka till startsidan.
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="mb-6 p-4 bg-muted rounded-lg text-left">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onReset} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Försök igen
            </Button>
            <Button onClick={onReload} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Ladda om sidan
            </Button>
          </div>

          <button
            onClick={onGoHome}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <Home className="w-3.5 h-3.5" />
            Gå till startsidan
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorBoundary;
