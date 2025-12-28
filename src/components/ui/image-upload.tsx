import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "./button";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  compressed?: Blob;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface ImageUploadProps {
  onUpload: (files: Blob[]) => Promise<void>;
  multiple?: boolean;
  maxFileSize?: number; // in MB
  maxWidth?: number;
  thumbnailWidth?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE = 5; // MB
const DEFAULT_MAX_WIDTH = 1920;
const THUMBNAIL_WIDTH = 300;

export function ImageUpload({
  onUpload,
  multiple = true,
  maxFileSize = DEFAULT_MAX_SIZE,
  maxWidth = DEFAULT_MAX_WIDTH,
  thumbnailWidth = THUMBNAIL_WIDTH,
  accept = "image/jpeg,image/png,image/webp",
  className,
  disabled = false,
}: ImageUploadProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Endast JPG, PNG och WebP stöds`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `${file.name}: Max ${maxFileSize}MB`;
    }
    return null;
  }, [maxFileSize]);

  const compressImage = useCallback(async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<Blob> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      onProgress: (progress: number) => {
        onProgress(Math.round(progress * 50)); // 0-50% for compression
      },
    };

    try {
      const compressed = await imageCompression(file, options);
      return compressed;
    } catch (error) {
      console.error("Compression failed:", error);
      return file;
    }
  }, [maxWidth]);

  const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles: ImageFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        newFiles.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'error',
          error,
        });
      } else {
        newFiles.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'pending',
        });
      }
    }

    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles.slice(0, 1));
  }, [validateFile, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const compressedBlobs: Blob[] = [];

      for (const imageFile of validFiles) {
        // Update status to compressing
        setFiles(prev => prev.map(f => 
          f.id === imageFile.id ? { ...f, status: 'compressing' as const } : f
        ));

        // Compress
        const compressed = await compressImage(imageFile.file, (progress) => {
          setFiles(prev => prev.map(f =>
            f.id === imageFile.id ? { ...f, progress } : f
          ));
        });

        // Update status to uploading
        setFiles(prev => prev.map(f =>
          f.id === imageFile.id ? { ...f, status: 'uploading' as const, progress: 75, compressed } : f
        ));

        compressedBlobs.push(compressed);
      }

      // Upload all files
      await onUpload(compressedBlobs);

      // Mark all as done
      setFiles(prev => prev.map(f =>
        validFiles.some(vf => vf.id === f.id) ? { ...f, status: 'done' as const, progress: 100 } : f
      ));

      // Clear after short delay
      setTimeout(() => {
        setFiles([]);
      }, 1500);
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' || f.status === 'compressing'
          ? { ...f, status: 'error' as const, error: 'Uppladdning misslyckades' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-6 h-6 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {isDragging ? "Släpp för att ladda upp" : "Dra och släpp bilder här"}
          </p>
          <p className="text-xs text-muted-foreground">
            eller klicka för att välja • Max {maxFileSize}MB per bild
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              >
                <img
                  src={file.preview}
                  alt="Preview"
                  className={cn(
                    "w-full h-full object-cover transition-opacity",
                    file.status === 'error' && "opacity-50"
                  )}
                />

                {/* Progress overlay */}
                {(file.status === 'compressing' || file.status === 'uploading') && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                    <Progress value={file.progress} className="w-2/3 h-1" />
                    <p className="text-xs text-white mt-1">
                      {file.status === 'compressing' ? 'Komprimerar...' : 'Laddar upp...'}
                    </p>
                  </div>
                )}

                {/* Done overlay */}
                {file.status === 'done' && (
                  <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Error overlay */}
                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center p-2">
                    <AlertCircle className="w-6 h-6 text-white mb-1" />
                    <p className="text-xs text-white text-center line-clamp-2">
                      {file.error}
                    </p>
                  </div>
                )}

                {/* Remove button */}
                {file.status !== 'uploading' && file.status !== 'compressing' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload button */}
          {pendingCount > 0 && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Laddar upp...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ladda upp {pendingCount} bild{pendingCount !== 1 ? 'er' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
