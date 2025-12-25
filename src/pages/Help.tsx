import { useState } from "react";
import {
  ChevronDown,
  Calendar,
  Star,
  ChefHat,
  ShoppingCart,
  CheckSquare,
  Bell,
  Share2,
  Sparkles,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Hur skapar jag en ny händelse?",
    answer:
      "Gå till Kalender eller Händelser-sidan och klicka på '+' knappen. Fyll i händelsens detaljer som titel, datum och typ. För större händelser kan du lägga till gästlista, budget och tidslinje.",
  },
  {
    question: "Hur delar jag en händelse med andra?",
    answer:
      "Öppna händelsen och klicka på dela-ikonen. Du kan välja att skapa en länk med läs- eller redigeringsbehörighet. Länken kan sedan skickas till vem som helst.",
  },
  {
    question: "Hur fungerar inköpslistor?",
    answer:
      "Du kan skapa inköpslistor manuellt eller generera dem automatiskt från recept. Bocka av varor när du handlar - listan synkroniseras i realtid så alla i hushållet ser uppdateringarna.",
  },
  {
    question: "Kan jag importera händelser från förra året?",
    answer:
      "Ja! När du skapar en ny händelse kan du välja att importera från en tidigare händelse. Detta kopierar uppgifter, recept, gästlista och annat från den valda händelsen.",
  },
  {
    question: "Hur fungerar AI-funktionerna?",
    answer:
      "AI kan hjälpa dig att söka i recept, kategorisera ingredienser automatiskt och generera inköpslistor. Aktivera AI-funktioner i Inställningar för att använda dem.",
  },
  {
    question: "Vad är hushållskoden?",
    answer:
      "Hushållskoden är en unik kod som identifierar ditt hushåll. Dela koden med familjemedlemmar så de kan logga in och se samma kalender, recept och listor.",
  },
  {
    question: "Hur ändrar jag säsongtema?",
    answer:
      "Appen byter automatiskt tema baserat på årstid och högtider. Du kan stänga av automatiska teman i Inställningar om du föredrar ett fast utseende.",
  },
  {
    question: "Kan jag exportera mina data?",
    answer:
      "Ja, gå till Inställningar > Datahantering för att exportera alla händelser, recept och uppgifter som JSON-filer.",
  },
];

const features = [
  {
    icon: Calendar,
    title: "Kalender",
    description: "Se alla händelser i månads-, vecko- eller dagvy. Navigera enkelt mellan datum.",
  },
  {
    icon: Star,
    title: "Händelser",
    description: "Skapa och hantera allt från vardagshändelser till stora fester med budget och gästlista.",
  },
  {
    icon: ChefHat,
    title: "Recept",
    description: "Spara familjerecept, lägg till bilder och koppla dem till händelser.",
  },
  {
    icon: ShoppingCart,
    title: "Inköpslistor",
    description: "Skapa listor manuellt eller generera från recept. Synkas i realtid.",
  },
  {
    icon: CheckSquare,
    title: "Uppgifter",
    description: "Håll koll på att-göra med påminnelser och koppling till händelser.",
  },
  {
    icon: Bell,
    title: "Påminnelser",
    description: "Få notiser inför händelser och uppgifter så du aldrig missar något.",
  },
  {
    icon: Share2,
    title: "Delning",
    description: "Dela händelser med familj och vänner via länk.",
  },
  {
    icon: Sparkles,
    title: "AI-funktioner",
    description: "Låt AI hjälpa dig söka recept och organisera inköpslistor.",
  },
];

const Help = () => {
  return (
    <AppLayout showHeader={false}>
      <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Hjälp & Support
        </h1>

        {/* Features Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Funktioner</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vanliga frågor</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Hittar du inte svaret på din fråga?{" "}
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
              >
                Kontakta support
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Help;
