import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { type CompressionSettings, PRESETS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// ============================================
// SMART COMPRESSION UTILITIES
// ============================================

/**
 * Detects if an image is text-like (documents, screenshots, handwriting)
 * by analyzing pixel data for low color variance, sharp edges, and white areas.
 */
function isTextLikeImage(imageData: ImageData): boolean {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  let colorVariance = 0;
  let edgeCount = 0;
  let whiteAreaRatio = 0;
  let samples = 0;
  
  // Analyze color variance and edge sharpness
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Count white/near-white areas (common in documents)
    if (r > 240 && g > 240 && b > 240) {
      whiteAreaRatio++;
    }
    
    samples++;
    
    // Sample variance with next pixel
    if (i + 4 < data.length) {
      const r2 = data[i + 4];
      const g2 = data[i + 5];
      const b2 = data[i + 6];
      
      const diff = Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2);
      colorVariance += diff;
      
      // High contrast = edge (common in text)
      if (diff > 100) {
        edgeCount++;
      }
    }
  }
  
  const avgVariance = colorVariance / Math.max(samples - 1, 1);
  const whiteRatio = whiteAreaRatio / Math.max(samples, 1);
  const edgeRatio = edgeCount / Math.max(samples - 1, 1);
  
  // Text-like if: low variance AND (many white areas OR many edges)
  return avgVariance < 80 && (whiteRatio > 0.3 || edgeRatio > 0.15);
}

/**
 * Non-linear quality mapping: preserves clarity at low slider values.
 * Maps 0-100 to 0.6-0.95 quality range.
 */
function mapQuality(sliderValue: number): number {
  const MIN_QUALITY = 0.6;
  const MAX_QUALITY = 0.95;
  const normalized = sliderValue / 100;
  
  // Curve formula: low values stay high quality, allows aggressive compression only at extremes
  return MIN_QUALITY + (normalized * (MAX_QUALITY - MIN_QUALITY));
}

/**
 * Smart format selection based on image content and user preference.
 */
function selectFormat(
  detectedTextLike: boolean,
  userFormat: string,
  hasTransparency: boolean
): string {
  // Text/documents: prefer PNG for lossless quality
  if (detectedTextLike) {
    return "image/png";
  }
  
  // Transparent images: use WebP or PNG
  if (hasTransparency && userFormat !== "image/jpeg") {
    return "image/webp";
  }
  
  // Default to user selection
  return userFormat;
}

/**
 * Resize image with high-quality scaling before compression.
 */
async function resizeImage(
  file: File,
  maxWidth: number | undefined,
  maintainAspectRatio: boolean
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (maxWidth && width > maxWidth) {
          width = maxWidth;
          if (maintainAspectRatio) {
            height = Math.round((img.height * maxWidth) / img.width);
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        // High-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas to blob conversion failed"));
        }, "image/png");
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze image to detect text and transparency.
 */
async function analyzeImage(file: File): Promise<{ isText: boolean; hasTransparency: boolean }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          resolve({ isText: false, hasTransparency: false });
          return;
        }
        
        canvas.width = Math.min(img.width, 200);
        canvas.height = Math.min(img.height, 200);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const isText = isTextLikeImage(imageData);
        
        // Check for transparency by sampling alpha channel
        const hasTransparency = Array.from(imageData.data)
          .filter((_, i) => (i + 1) % 4 === 0)
          .some((alpha) => alpha < 255);
        
        resolve({ isText, hasTransparency });
      };
      img.onerror = () => resolve({ isText: false, hasTransparency: false });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ isText: false, hasTransparency: false });
    reader.readAsDataURL(file);
  });
}

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

  // Compress image with smart logic
  const compressImage = useCallback(async () => {
    if (!originalFile) return;

    try {
      setIsCompressing(true);
      setProgress(10);

      // Analyze image for intelligent compression
      const { isText, hasTransparency } = await analyzeImage(originalFile);
      setProgress(20);

      // Map quality with non-linear curve
      let mappedQuality = mapQuality(settings.quality);
      
      // CRITICAL: Enforce minimum quality thresholds
      if (isText) {
        // Text/documents: never below 0.80 (80%)
        mappedQuality = Math.max(mappedQuality, 0.80);
      } else {
        // Photos: never below 0.70 (70%)
        mappedQuality = Math.max(mappedQuality, 0.70);
      }
      
      const finalQuality = mappedQuality;
      
      // Select best format - text MUST use PNG (lossless)
      const bestFormat = selectFormat(isText, settings.format, hasTransparency);
      
      setProgress(30);

      // For text images, always use PNG lossless
      if (isText && bestFormat === "image/png") {
        const textOptions = {
          maxSizeMB: 50,
          maxWidthOrHeight: settings.width || undefined,
          useWebWorker: true,
          initialQuality: 1.0, // Lossless PNG for text
          fileType: "image/png",
          onProgress: (p: number) => setProgress(Math.round(30 + (p * 0.6))),
        };
        
        const compressed = await imageCompression(originalFile, textOptions);
        setCompressedFile(compressed);
        
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(compressed));
        setProgress(100);
      } else {
        // For photos, use quality-based compression
        const options = {
          maxSizeMB: 50,
          maxWidthOrHeight: settings.width || undefined,
          useWebWorker: true,
          initialQuality: finalQuality,
          fileType: bestFormat,
          onProgress: (p: number) => setProgress(Math.round(30 + (p * 0.6))), // 30-90%
        };

        let compressed = await imageCompression(originalFile, options);
        
        setProgress(90);

        // Fallback: if still large, try WebP lossless for photos
        if (!isText && compressed.size > originalFile.size * 0.7) {
          const webpOptions = {
            maxSizeMB: 50,
            maxWidthOrHeight: settings.width || undefined,
            useWebWorker: true,
            initialQuality: 0.95, // Near-lossless
            fileType: "image/webp",
          };
          const webpCompressed = await imageCompression(originalFile, webpOptions);
          
          if (webpCompressed.size < compressed.size) {
            compressed = webpCompressed;
          }
        }
        
        setCompressedFile(compressed);
        
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(compressed));
        
        setProgress(100);
      }
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
