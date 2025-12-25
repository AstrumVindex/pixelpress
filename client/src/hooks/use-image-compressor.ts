import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { type CompressionSettings, PRESETS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<CompressionSettings>(PRESETS[0].settings);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    setOriginalFile(file);
    setOriginalPreviewUrl(URL.createObjectURL(file));
    setCompressedFile(null);
    setPreviewUrl(null);
  }, [toast]);

  // Compress image
  const compressImage = useCallback(async () => {
    if (!originalFile) return;

    try {
      setIsCompressing(true);
      setProgress(10); // Start progress

      const options = {
        maxSizeMB: 50, // Effectively unlimited, we rely on quality
        maxWidthOrHeight: settings.width || undefined,
        useWebWorker: true,
        initialQuality: settings.quality / 100,
        fileType: settings.format,
        onProgress: (p: number) => setProgress(Math.max(p, 20)), // Keep UI moving
      };

      const compressed = await imageCompression(originalFile, options);
      
      setCompressedFile(compressed);
      
      // Cleanup old preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(compressed));
      
      setProgress(100);
    } catch (error) {
      console.error("Compression error:", error);
      toast({
        title: "Compression failed",
        description: "Something went wrong while processing the image.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  }, [originalFile, settings, previewUrl, toast]);

  // Debounced auto-compression when settings change
  useEffect(() => {
    if (!originalFile) return;
    
    const timer = setTimeout(() => {
      compressImage();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [settings, originalFile]); // Removed compressImage from deps to avoid loop if not memoized correctly upstream

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    };
  }, []);

  const reset = useCallback(() => {
    setOriginalFile(null);
    setCompressedFile(null);
    setPreviewUrl(null);
    setOriginalPreviewUrl(null);
    setProgress(0);
  }, [previewUrl, originalPreviewUrl]);

  return {
    originalFile,
    compressedFile,
    isCompressing,
    progress,
    settings,
    setSettings,
    previewUrl,
    originalPreviewUrl,
    handleFileSelect,
    reset
  };
}
