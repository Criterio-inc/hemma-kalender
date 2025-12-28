import { useState, useEffect, useCallback, useRef } from "react";
import { 
  X, ChevronLeft, ChevronRight, Download, Share2, 
  ZoomIn, ZoomOut, RotateCw 
} from "lucide-react";
import { Dialog, DialogContent } from "./dialog";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LightboxImage {
  url: string;
  alt?: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onCaptionEdit?: (index: number, caption: string) => void;
  showDownload?: boolean;
  showShare?: boolean;
}

export function Lightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  onCaptionEdit,
  showDownload = true,
  showShare = true,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setRotation(0);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // Navigate to next image
  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScale(1);
      setRotation(0);
      setIsLoading(true);
    }
  }, [currentIndex, images.length]);

  // Navigate to previous image
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setScale(1);
      setRotation(0);
      setIsLoading(true);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case '+':
        case '=':
          setScale(prev => Math.min(prev + 0.5, 4));
          break;
        case '-':
          setScale(prev => Math.max(prev - 0.5, 0.5));
          break;
        case 'r':
          setRotation(prev => prev + 90);
          break;
        case '0':
          setScale(1);
          setRotation(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    // Minimum swipe distance
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        goPrev();
      } else {
        goNext();
      }
    }

    setTouchStart(null);
  };

  // Download handler
  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Bild nedladdad");
    } catch {
      toast.error("Kunde inte ladda ner bilden");
    }
  };

  // Share handler
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.caption || 'Bild',
          url: currentImage.url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(currentImage.url);
      toast.success("Länk kopierad");
    }
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white h-10 w-10 sm:h-12 sm:w-12 rounded-full"
              onClick={goPrev}
              aria-label="Föregående bild"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {currentIndex < images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white h-10 w-10 sm:h-12 sm:w-12 rounded-full"
              onClick={goNext}
              aria-label="Nästa bild"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}

          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/60 to-transparent">
            {/* Counter */}
            <span className="text-white text-sm font-medium px-3 py-1 rounded-full bg-black/40">
              {currentIndex + 1} / {images.length}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-9 w-9"
                onClick={() => setScale(prev => Math.min(prev + 0.5, 4))}
                aria-label="Zooma in"
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-9 w-9"
                onClick={() => setScale(prev => Math.max(prev - 0.5, 0.5))}
                aria-label="Zooma ut"
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-9 w-9"
                onClick={() => setRotation(prev => prev + 90)}
                aria-label="Rotera"
              >
                <RotateCw className="w-5 h-5" />
              </Button>
              {showDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-9 w-9"
                  onClick={handleDownload}
                  aria-label="Ladda ner"
                >
                  <Download className="w-5 h-5" />
                </Button>
              )}
              {showShare && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-9 w-9"
                  onClick={handleShare}
                  aria-label="Dela"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-9 w-9"
                onClick={onClose}
                aria-label="Stäng"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden flex items-center justify-center w-full h-full p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <img
              src={currentImage.url}
              alt={currentImage.alt || ''}
              className={cn(
                "max-w-full max-h-[calc(100vh-120px)] object-contain transition-all duration-200 cursor-grab active:cursor-grabbing",
                isLoading && "opacity-0"
              )}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
              onLoad={() => setIsLoading(false)}
              draggable={false}
            />
          </div>

          {/* Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-0 inset-x-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-center text-sm sm:text-base">
                {currentImage.caption}
              </p>
            </div>
          )}

          {/* Thumbnail strip (for more than 3 images) */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-2 bg-black/40 rounded-lg max-w-[90vw] overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setScale(1);
                    setRotation(0);
                    setIsLoading(true);
                  }}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all",
                    idx === currentIndex
                      ? "ring-2 ring-white scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Lightbox;
