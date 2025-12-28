import { useState } from "react";
import { Sparkles, ChefHat, Utensils, Calendar, Leaf, Loader2, Plus, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIFeatures } from "@/hooks/useAIFeatures";
import { cn } from "@/lib/utils";

interface AIRecipeRecommendationsProps {
  householdCode: string;
  onAddToMealPlan?: (recipe: any) => void;
}

const seasonOptions = [
  { value: 'seasonal', label: 'Säsongsbetonat', icon: Leaf },
  { value: 'general', label: 'Allmänt', icon: ChefHat },
];

const AIRecipeRecommendations = ({ householdCode, onAddToMealPlan }: AIRecipeRecommendationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("seasonal");
  const [ingredients, setIngredients] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState("custom");
  const [guestCount, setGuestCount] = useState("4");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [recommendations, setRecommendations] = useState<any>(null);

  const { isLoading, getRecipeRecommendations } = useAIFeatures(householdCode);

  const handleGetRecommendations = async () => {
    let context = {};
    
    switch (activeTab) {
      case 'seasonal':
        context = {};
        break;
      case 'ingredients':
        context = { ingredients: ingredients.split(',').map(i => i.trim()).filter(Boolean) };
        break;
      case 'event':
        context = { eventName, eventCategory, guestCount: parseInt(guestCount) };
        break;
      case 'dietary':
        context = { restrictions: dietaryRestrictions, servings: 4 };
        break;
    }

    const result = await getRecipeRecommendations(activeTab as any, context);
    if (result) {
      setRecommendations(result);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'enkel': return 'bg-green-500/10 text-green-600';
      case 'mellan': return 'bg-yellow-500/10 text-yellow-600';
      case 'avancerad': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI-förslag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI-receptförslag
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="seasonal">Säsong</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredienser</TabsTrigger>
            <TabsTrigger value="event">Händelse</TabsTrigger>
            <TabsTrigger value="dietary">Kost</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            <TabsContent value="seasonal" className="mt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Få receptförslag baserat på aktuell säsong och kommande högtider.
              </p>
            </TabsContent>

            <TabsContent value="ingredients" className="mt-0">
              <div className="space-y-2 mb-4">
                <Label>Vilka ingredienser har du hemma?</Label>
                <Input
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="T.ex. potatis, lök, grädde, bacon"
                />
                <p className="text-xs text-muted-foreground">Separera med komma</p>
              </div>
            </TabsContent>

            <TabsContent value="event" className="mt-0">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Händelse</Label>
                  <Input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="T.ex. Midsommarfest"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Antal gäster</Label>
                  <Input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dietary" className="mt-0">
              <div className="space-y-2 mb-4">
                <Label>Kostbegränsningar</Label>
                <Select value={dietaryRestrictions} onValueChange={setDietaryRestrictions}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="vegetarian">Vegetariskt</SelectItem>
                    <SelectItem value="vegan">Veganskt</SelectItem>
                    <SelectItem value="glutenfree">Glutenfritt</SelectItem>
                    <SelectItem value="lactosefree">Laktosfritt</SelectItem>
                    <SelectItem value="lowcarb">Lågkolhydrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <Button 
              onClick={handleGetRecommendations} 
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Genererar förslag...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Få AI-förslag
                </>
              )}
            </Button>

            {/* Results */}
            {recommendations && (
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {recommendations.summary && (
                    <p className="text-sm text-muted-foreground mb-4">{recommendations.summary}</p>
                  )}
                  
                  {recommendations.recommendations?.map((rec: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{rec.title}</h4>
                              {rec.isExisting && (
                                <Badge variant="secondary" className="text-xs">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Sparad
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getDifficultyColor(rec.difficulty)}>
                                {rec.difficulty}
                              </Badge>
                              <Badge variant="outline">{rec.estimatedTime} min</Badge>
                              {rec.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 italic">{rec.reason}</p>
                          </div>
                          {onAddToMealPlan && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => onAddToMealPlan(rec)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AIRecipeRecommendations;
