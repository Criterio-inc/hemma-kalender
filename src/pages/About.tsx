import { Heart, ExternalLink, Mail, Github } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <AppLayout showHeader={false}>
      <div className="container max-w-lg mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Om Appen
        </h1>

        {/* App Info */}
        <Card className="mb-6">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">Familjekalendern</h2>
            <p className="text-sm text-muted-foreground mb-4">Version 1.0.0</p>
            <p className="text-sm text-muted-foreground">
              En app för att planera och organisera familjens händelser, recept,
              inköp och uppgifter tillsammans.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Funktioner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">Delad familjekalender</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">Recepthantering med bilder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">Inköpslistor som synkas i realtid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">Uppgifter med påminnelser</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">Budget- och gästhantering för events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">AI-assisterade funktioner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="text-sm">Säsongsteman</span>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Länkar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <a href="mailto:support@example.com">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Feedback & Support
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Integritetspolicy
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Användarvillkor
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Skapad med <Heart className="w-3 h-3 inline text-red-500" /> för familjer
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © 2024 Familjekalendern
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default About;
