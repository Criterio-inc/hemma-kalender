import { useState, useRef, useCallback } from "react";
import { Image as ImageIcon, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lightbox } from "@/components/ui/lightbox";
import { LazyImage } from "@/components/ui/lazy-image";
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
  useDeleteImage,
  uploadEventImage,
} from "@/hooks/useImages";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface EventImageGalleryProps {
  eventId: string;
  householdCode: string;
}

const EventImageGallery = ({ eventId, householdCode }: EventImageGalleryProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deletingImage, setDeletingImage] = useState<EventImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useEventImages(eventId);
  const createImage = useCreateImage();
  const deleteImage = useDeleteImage();

  const compressImage = useCallback(async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch {
      return file;
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const validFiles = files.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Endast JPG, PNG, WebP stöds`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} är för stor (max 5MB)`);
        return false;
      }
      return true;
    });

    let uploaded = 0;
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(Math.round((i / validFiles.length) * 50));
        
        // Compress the image
        const compressed = await compressImage(file);
        setUploadProgress(Math.round(((i + 0.5) / validFiles.length) * 100));
        
        // Upload
        const url = await uploadEventImage(compressed);
        await createImage.mutateAsync({
          household_code: householdCode,
          event_id: eventId,
          url,
        });
        uploaded++;
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }
      if (uploaded > 0) {
        toast.success(`${uploaded} bild(er) uppladdad(e)!`);
      }
    } catch (error) {
      toast.error("Kunde inte ladda upp bilderna");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingImage) return;
    try {
      await deleteImage.mutateAsync(deletingImage.id);
      toast.success("Bild borttagen");
      setDeletingImage(null);
      setLightboxOpen(false);
    } catch (error) {
      toast.error("Kunde inte ta bort bilden");
    }
  };

  const lightboxImages = images.map(img => ({
    url: img.url,
    alt: img.caption || "Händelsebild",
    caption: img.caption || undefined,
  }));

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
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Komprimerar och laddar upp... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Gallery grid */}
      {images.length === 0 ? (
        <div
          className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Klicka för att ladda upp bilder</p>
          <p className="text-xs text-muted-foreground mt-1">Max 5MB per bild • JPG, PNG, WebP</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleImageClick(index)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <LazyImage
                src={image.url}
                alt={image.caption || "Händelsebild"}
                aspectRatio="square"
                className="transition-transform group-hover:scale-105"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.caption}</p>
                </div>
              )}
              {/* Delete button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingImage(image);
                }}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                aria-label="Ta bort bild"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        showDownload
        showShare
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingImage} onOpenChange={() => setDeletingImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort bild?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort denna bild? Detta kan inte ångras.
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
