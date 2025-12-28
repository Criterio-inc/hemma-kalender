import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "auto" | string;
  blurPlaceholder?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = memo(function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderClassName,
  fallbackSrc = "/placeholder.svg",
  aspectRatio = "auto",
  blurPlaceholder = true,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "auto":
        return "";
      default:
        return aspectRatio;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        getAspectRatioClass(),
        placeholderClassName
      )}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted",
            blurPlaceholder && "animate-pulse"
          )}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError ? fallbackSrc : src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}

      {/* Blur-up effect overlay */}
      {blurPlaceholder && !isLoaded && isInView && (
        <div 
          className="absolute inset-0 backdrop-blur-xl bg-muted/30"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

export { LazyImage };
export default LazyImage;
