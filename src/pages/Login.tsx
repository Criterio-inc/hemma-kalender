import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Home, Lock, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [householdCode, setHouseholdCode] = useState("");
  const [password, setPassword] = useState("");
  const [householdName, setHouseholdName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!householdCode.trim() || !password.trim()) {
      toast.error("Fyll i alla fält");
      return;
    }

    if (householdCode.length < 3) {
      toast.error("Hushållskoden måste vara minst 3 tecken");
      return;
    }

    if (password.length < 4) {
      toast.error("Lösenordet måste vara minst 4 tecken");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        const result = await register(householdCode, password, householdName);
        if (result.success) {
          toast.success("Hushåll skapat! Välkommen!");
          navigate("/calendar");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await login(householdCode, password);
        if (result.success) {
          toast.success(`Välkommen tillbaka, ${result.session?.householdName}!`);
          navigate("/calendar");
        } else {
          toast.error(result.error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-primary/15 blur-xl" />
      <div className="absolute bottom-20 right-10 w-36 h-36 rounded-full bg-primary/10 blur-xl" />
      <div className="absolute top-1/3 right-20 w-20 h-20 rounded-full bg-muted blur-lg" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow mb-6">
            <Calendar className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground mb-2">
            Familjekalendern
          </h1>
          <p className="text-muted-foreground font-medium">
            Håll koll på hela familjens aktiviteter
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50 animate-scale-in">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                !isRegistering
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Logga in
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isRegistering
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Skapa nytt
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="householdName" className="text-sm font-semibold">
                  Familjens namn (valfritt)
                </Label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="householdName"
                    type="text"
                    placeholder="T.ex. Familjen Svensson"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="householdCode" className="text-sm font-semibold">
                Hushållskod
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="householdCode"
                  type="text"
                  placeholder="T.ex. SVENSSON2024"
                  value={householdCode}
                  onChange={(e) => setHouseholdCode(e.target.value.toUpperCase())}
                  className="pl-12 uppercase"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isRegistering
                  ? "Välj en unik kod som alla i familjen kommer ihåg"
                  : "Ange koden för ditt hushåll"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Lösenord
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Vänta...
                </span>
              ) : (
                <>
                  {isRegistering ? "Skapa hushåll" : "Logga in"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegistering
              ? "Har du redan ett hushåll? "
              : "Inget hushåll ännu? "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary font-semibold hover:underline"
            >
              {isRegistering ? "Logga in här" : "Skapa ett här"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          🇸🇪 Med svenska helgdagar
        </p>
      </div>
    </div>
  );
};

export default Login;
