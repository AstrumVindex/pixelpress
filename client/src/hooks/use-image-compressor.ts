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
  let highContrastCount = 0;
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
        if (diff > 150) highContrastCount++;
      }
    }
  }
  
  const avgVariance = colorVariance / Math.max(samples - 1, 1);
  const whiteRatio = whiteAreaRatio / Math.max(samples, 1);
  const edgeRatio = edgeCount / Math.max(samples - 1, 1);
  const highContrastRatio = highContrastCount / Math.max(samples - 1, 1);
  
  // Text-like if: low variance AND (many white areas OR many sharp edges)
  // Uses multiple thresholds for robust detection
  const hasWhiteAreas = whiteRatio > 0.25;
  const hasSharpEdges = edgeRatio > 0.12 && highContrastRatio > 0.08;
  const hasLowVariance = avgVariance < 85;
  
  return hasLowVariance && (hasWhiteAreas || hasSharpEdges);
}

/**
 * Non-linear quality mapping: preserves clarity at low slider values.
 * Maps 0-100 to 0.7-0.95 quality range with aggressive curvature.
 * Prevents aggressive compression at moderate slider positions.
 */
function mapQuality(sliderValue: number): number {
  const MIN_QUALITY = 0.7;
  const MAX_QUALITY = 0.95;
  const normalized = sliderValue / 100;
  
  // Exponential curve: quality stays high until slider reaches ~70%
  // This protects quality at conservative settings
  const curvedNormalized = Math.pow(normalized, 0.7);
  return MIN_QUALITY + (curvedNormalized * (MAX_QUALITY - MIN_QUALITY));
}

/**
 * Smart format selection based on image content and user preference.
 * RESPECTS user's explicit format choice - quality is protected via quality floors instead.
 */
function selectFormat(
  detectedTextLike: boolean,
  userFormat: string,
  hasTransparency: boolean
): string {
  // ALWAYS respect user's format selection
  // Quality protection is handled via quality minimum floors, not format override
  
  // Only override for transparency if needed
  if (hasTransparency && userFormat === "image/jpeg") {
    return "image/webp"; // JPEG doesn't support transparency
  }
  
  // Default to user selection
  return userFormat;
}

/**
 * Force convert image to a specific format using canvas.
 * This ensures the output format is ALWAYS the selected format.
 */
async function forceConvertFormat(
  blob: Blob,
  targetFormat: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          
          // Validate dimensions before setting (prevent invalid canvas size errors)
          const width = Math.max(1, Math.floor(img.width) || 1);
          const height = Math.max(1, Math.floor(img.height) || 1);
          
          if (width > 65536 || height > 65536) {
            // Canvas size limit, use original blob
            resolve(blob);
            return;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(blob);
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          // Force conversion to target format
          canvas.toBlob((convertedBlob) => {
            if (convertedBlob) {
              resolve(convertedBlob);
            } else {
              resolve(blob);
            }
          }, targetFormat, quality);
        } catch (err) {
          // If any error during conversion, use original blob
          console.warn("Canvas conversion error:", err);
          resolve(blob);
        }
      };
      img.onerror = () => resolve(blob);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(blob);
    reader.readAsDataURL(blob);
  });
}

/**
 * Resize image with maximum quality scaling before compression.
 * Uses high-quality interpolation to preserve edge clarity.
 */
async function resizeImage(
  file: File,
  maxWidth: number | undefined,
  maxHeight: number | undefined,
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
        if (maxWidth || maxHeight) {
          if (maxWidth && maxHeight && !maintainAspectRatio) {
            width = maxWidth;
            height = maxHeight;
          } else if (maxWidth && (!maxHeight || maintainAspectRatio)) {
            if (width > maxWidth) {
              width = maxWidth;
              if (maintainAspectRatio) {
                height = Math.round((img.height * maxWidth) / img.width);
              }
            }
          } else if (maxHeight) {
            if (height > maxHeight) {
              height = maxHeight;
              if (maintainAspectRatio) {
                width = Math.round((img.width * maxHeight) / img.height);
              }
            }
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        // Maximum quality image smoothing to prevent aliasing and pixelation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // Draw image with high-quality interpolation
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to PNG for lossless intermediate
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
      
      // Select best format - RESPECTS user choice
      const bestFormat = selectFormat(isText, settings.format, hasTransparency);
      
      setProgress(30);

      // 3. OPTIMIZED COMPRESSION FOR SMALL IMAGES
      // If the image is already very small (< 50KB), we need to be extremely careful.
      // We'll use a direct approach to avoid overhead from the compression library.
      
      let finalBlob: Blob;
      
      if (originalFile.size < 50 * 1024 && settings.quality > 50 && !settings.width && !settings.height) {
        // For tiny images, just use forceConvertFormat directly to avoid library overhead
        finalBlob = await forceConvertFormat(originalFile, bestFormat, finalQuality);
      } else {
        // Compress with user's chosen format
        const options = {
          maxSizeMB: 50,
          maxWidthOrHeight: settings.width || settings.height || undefined,
          useWebWorker: true,
          initialQuality: finalQuality,
          fileType: "image/jpeg", // Library handles JPEG best, we convert after
          onProgress: (p: number) => setProgress(Math.round(30 + (p * 0.6))), // 30-90%
        };

        // If both dimensions specified and aspect ratio not maintained, 
        // or if height is specified, we use our custom resize first
        let fileToCompress: File | Blob = originalFile;
        if ((settings.width && settings.height && !settings.maintainAspectRatio) || settings.height) {
          fileToCompress = await resizeImage(
            originalFile, 
            settings.width, 
            settings.height, 
            settings.maintainAspectRatio
          );
        }

        const compressed = await imageCompression(fileToCompress as File, options);
        setProgress(85);

        // 4. ENFORCE FORMAT AND METADATA INTEGRITY
        // We use canvas to re-draw the image and convert it. This strips any corrupted
        // or incompatible metadata that Photoshop/Photopea might choke on.
        // For very small images, we compare sizes and keep the smallest.
        const blobToFinalize = (compressed.size < originalFile.size * 1.02) ? compressed : originalFile;
        
        finalBlob = await forceConvertFormat(
          blobToFinalize, 
          bestFormat, 
          finalQuality
        );
      }
      
      // FINAL SIZE PROTECTION: If somehow it's still bigger, and it's same format, use original
      if (finalBlob.size >= originalFile.size && finalBlob.type === originalFile.type && !settings.width && !settings.height) {
        finalBlob = originalFile;
      }
      
      // Update the extension if format changed
      const getExtension = (mime: string) => {
        if (mime === "image/png") return "png";
        if (mime === "image/webp") return "webp";
        return "jpg";
      };
      
      const baseName = originalFile.name.replace(/\.[^/.]+$/, "");
      const finalName = `${baseName}.${getExtension(finalBlob.type)}`;

      setCompressedFile(new File([finalBlob], finalName, {
        type: finalBlob.type,
        lastModified: Date.now(),
      }));
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(finalBlob));
      
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
