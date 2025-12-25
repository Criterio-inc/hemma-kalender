import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Recipe,
  RecipeInsert,
  RecipeUpdate,
  Ingredient,
  useCreateRecipe,
  useUpdateRecipe,
  uploadRecipeImage,
} from "@/hooks/useRecipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  householdCode: string;
  recipe?: Recipe | null;
}

const categories = [
  { value: "main", label: "Huvudrätt" },
  { value: "dessert", label: "Dessert" },
  { value: "appetizer", label: "Förrätt" },
  { value: "side", label: "Tillbehör" },
  { value: "drink", label: "Dryck" },
  { value: "breakfast", label: "Frukost" },
  { value: "snack", label: "Mellanmål" },
];

const suggestedTags = [
  "jul", "påsk", "midsommar", "vegetarisk", "vegan",
  "fisk", "kött", "kyckling", "soppa", "sallad",
  "bakning", "barnvänlig", "snabb", "festmat"
];

const emptyIngredient: Ingredient = { name: "", quantity: "", unit: "" };

const RecipeForm = ({ isOpen, onClose, householdCode, recipe }: RecipeFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ ...emptyIngredient }]);
  const [instructions, setInstructions] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("main");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setDescription(recipe.description || "");
      setIngredients(recipe.ingredients?.length ? recipe.ingredients : [{ ...emptyIngredient }]);
      setInstructions(recipe.instructions || "");
      setPrepTime(recipe.prep_time?.toString() || "");
      setCookTime(recipe.cook_time?.toString() || "");
      setServings(recipe.servings?.toString() || "");
      setCategory(recipe.category || "main");
      setTags(recipe.tags || []);
      setImageUrl(recipe.image_url || "");
      setImagePreview(recipe.image_url || "");
    } else {
      resetForm();
    }
  }, [recipe, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIngredients([{ ...emptyIngredient }]);
    setInstructions("");
    setPrepTime("");
    setCookTime("");
    setServings("");
    setCategory("main");
    setTags([]);
    setTagInput("");
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ...emptyIngredient }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Bilden får max vara 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Bilden får max vara 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Ange en titel");
      return;
    }

    try {
      let finalImageUrl = imageUrl;

      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await uploadRecipeImage(imageFile);
        } catch (error) {
          toast.error("Kunde inte ladda upp bilden");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Filter out empty ingredients
      const validIngredients = ingredients.filter((i) => i.name.trim());

      if (recipe) {
        const updates: RecipeUpdate = {
          title: title.trim(),
          description: description.trim() || null,
          ingredients: validIngredients.length ? validIngredients : null,
          instructions: instructions.trim() || null,
          prep_time: prepTime ? parseInt(prepTime) : null,
          cook_time: cookTime ? parseInt(cookTime) : null,
          servings: servings ? parseInt(servings) : null,
          category,
          tags: tags.length ? tags : null,
          image_url: finalImageUrl || null,
        };

        await updateRecipe.mutateAsync({ id: recipe.id, updates });
        toast.success("Recept uppdaterat!");
      } else {
        const newRecipe: RecipeInsert = {
          household_code: householdCode,
          title: title.trim(),
          description: description.trim() || null,
          ingredients: validIngredients.length ? validIngredients : null,
          instructions: instructions.trim() || null,
          prep_time: prepTime ? parseInt(prepTime) : null,
          cook_time: cookTime ? parseInt(cookTime) : null,
          servings: servings ? parseInt(servings) : null,
          category,
          tags: tags.length ? tags : null,
          image_url: finalImageUrl || null,
        };

        await createRecipe.mutateAsync(newRecipe);
        toast.success("Recept skapat!");
      }

      onClose();
    } catch (error) {
      toast.error(recipe ? "Kunde inte uppdatera receptet" : "Kunde inte skapa receptet");
    }
  };

  const isPending = createRecipe.isPending || updateRecipe.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? "Redigera recept" : "Nytt recept"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Bild</Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-xl cursor-pointer",
                "transition-colors hover:border-primary/50",
                imagePreview ? "border-transparent" : "border-border p-8"
              )}
            >
              {imagePreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview("");
                      setImageFile(null);
                      setImageUrl("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Dra och släpp eller klicka för att ladda upp
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Farmors köttbullar"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berätta om receptet..."
              rows={2}
            />
          </div>

          {/* Category and times */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prep">Förb. tid (min)</Label>
              <Input
                id="prep"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cook">Tillagningstid</Label>
              <Input
                id="cook"
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Portioner</Label>
              <Input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <Label>Ingredienser</Label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  placeholder="Mängd"
                  className="w-20"
                />
                <Input
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                  placeholder="Enhet"
                  className="w-20"
                />
                <Input
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                  placeholder="Ingrediens"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
              <Plus className="w-4 h-4 mr-1" />
              Lägg till ingrediens
            </Button>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instruktioner</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Steg-för-steg..."
              rows={5}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Taggar</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Lägg till tagg..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedTags
                .filter((t) => !tags.includes(t))
                .slice(0, 8)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Avbryt
            </Button>
            <Button type="submit" variant="hero" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? "Laddar upp..." : "Sparar..."}
                </>
              ) : recipe ? "Spara" : "Skapa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeForm;
