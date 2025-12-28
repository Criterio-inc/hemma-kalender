import { useState, useRef } from "react";
import { Image as ImageIcon, Plus, Trash2, Upload, X, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  EventImage,
  useEventImages,
  useCreateImage,
  useUpdateImage,
  useDeleteImage,
  uploadEventImage,
} from "@/hooks/useImages";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventImageGalleryProps {
  eventId: string;
  householdCode: string;
}

const EventImageGallery = ({ eventId, householdCode }: EventImageGalleryProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<EventImage | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");
  const [deletingImage, setDeletingImage] = useState<EventImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useEventImages(eventId);
  const createImage = useCreateImage();
  const updateImage = useUpdateImage();
  const deleteImage = useDeleteImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} är för stor (max 10MB)`);
          continue;
        }

        const url = await uploadEventImage(file);
        await createImage.mutateAsync({
          household_code: householdCode,
          event_id: eventId,
          url,
        });
      }
      toast.success(`${files.length} bild(er) uppladdad(e)!`);
    } catch (error) {
      toast.error("Kunde inte ladda upp bilderna");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateCaption = async (id: string) => {
    try {
      await updateImage.mutateAsync({ id, updates: { caption: captionValue || null } });
      toast.success("Bildtext uppdaterad");
      setEditingCaption(null);
    } catch (error) {
      toast.error("Kunde inte uppdatera bildtexten");
    }
  };

  const handleDelete = async () => {
    if (!deletingImage) return;
    try {
      await deleteImage.mutateAsync(deletingImage.id);
      toast.success("Bild borttagen");
      setDeletingImage(null);
      setLightboxImage(null);
    } catch (error) {
      toast.error("Kunde inte ta bort bilden");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-muted rounded" />
          <div className="aspect-square bg-muted rounded" />
          <div className="aspect-square bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Bilder</h4>
          <span className="text-sm text-muted-foreground">({images.length})</span>
        </div>
        <Button
          variant="hero"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          Ladda upp
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Gallery grid */}
      {images.length === 0 ? (
        <div
          className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Klicka för att ladda upp bilder</p>
          <p className="text-xs text-muted-foreground mt-1">Max 10MB per bild</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setLightboxImage(image)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={image.url}
                alt={image.caption || "Event image"}
                loading="lazy"
                decoding="async"
                width={200}
                height={200}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black/95">
          {lightboxImage && (
            <div className="relative">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.caption || ""}
                loading="eager"
                decoding="async"
                className="w-full max-h-[80vh] object-contain"
              />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                onClick={() => setLightboxImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Caption and actions */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {editingCaption === lightboxImage.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={captionValue}
                      onChange={(e) => setCaptionValue(e.target.value)}
                      placeholder="Lägg till bildtext..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateCaption(lightboxImage.id)}
                    >
                      Spara
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCaption(null)}
                    >
                      Avbryt
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white">
                      {lightboxImage.caption || (
                        <span className="text-white/50 italic">Ingen bildtext</span>
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => {
                          setEditingCaption(lightboxImage.id);
                          setCaptionValue(lightboxImage.caption || "");
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Redigera
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/20"
                        onClick={() => setDeletingImage(lightboxImage)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Ta bort
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingImage} onOpenChange={() => setDeletingImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort bild?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort denna bild?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventImageGallery;
