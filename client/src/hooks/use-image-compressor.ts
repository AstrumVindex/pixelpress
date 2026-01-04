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

// Mobile-safe canvas limits (conservative for older devices)
const MAX_CANVAS_DIMENSION = 4096; // Max width or height
const MAX_CANVAS_PIXELS = 16777216; // 16 megapixels (4096 x 4096)

/**
 * Clamp dimensions to mobile-safe limits while maintaining aspect ratio.
 */
function clampDimensions(width: number, height: number): { width: number; height: number; wasResized: boolean } {
  let w = width;
  let h = height;
  let wasResized = false;
  
  // Clamp individual dimensions
  if (w > MAX_CANVAS_DIMENSION) {
    h = Math.round(h * (MAX_CANVAS_DIMENSION / w));
    w = MAX_CANVAS_DIMENSION;
    wasResized = true;
  }
  if (h > MAX_CANVAS_DIMENSION) {
    w = Math.round(w * (MAX_CANVAS_DIMENSION / h));
    h = MAX_CANVAS_DIMENSION;
    wasResized = true;
  }
  
  // Clamp total pixels
  const pixels = w * h;
  if (pixels > MAX_CANVAS_PIXELS) {
    const scale = Math.sqrt(MAX_CANVAS_PIXELS / pixels);
    w = Math.floor(w * scale);
    h = Math.floor(h * scale);
    wasResized = true;
  }
  
  return { width: Math.max(1, w), height: Math.max(1, h), wasResized };
}

/**
 * Force convert image to a specific format using canvas.toBlob().
 * Ensures proper MIME type, quality range, and AVIF fallback.
 * Only clamps dimensions if canvas would exceed mobile limits.
 */
async function forceConvertFormat(
  blob: Blob,
  targetFormat: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          
          // Only clamp if dimensions would cause mobile canvas failure
          // Try original size first, fall back to clamped if context fails
          let width = img.width;
          let height = img.height;
          const needsClamp = width * height > MAX_CANVAS_PIXELS || width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION;
          
          if (needsClamp) {
            const clamped = clampDimensions(width, height);
            width = clamped.width;
            height = clamped.height;
            console.info(`Image clamped from ${img.width}x${img.height} to ${width}x${height} for mobile compatibility`);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.warn("Canvas context unavailable - device may have memory constraints");
            resolve(blob);
            return;
          }
          
          // Enable high-quality scaling if we're downscaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // PNG uses lossless compression - quality param should be undefined
          // JPEG/WebP use quality in range 0-1
          const qualityParam = targetFormat === "image/png" ? undefined : Math.min(1, Math.max(0, quality));
          
          // Helper to create blob with validation
          const createBlob = (format: string, q: number | undefined): Promise<Blob | null> => {
            return new Promise((res) => {
              canvas.toBlob((result) => {
                // Validate blob: must exist, have correct type, and have content
                if (result && result.size > 0 && result.type === format) {
                  res(result);
                } else {
                  res(null);
                }
              }, format, q);
            });
          };
          
          // Try target format first
          createBlob(targetFormat, qualityParam).then((result) => {
            if (result) {
              resolve(result);
              return;
            }
            
            // AVIF fallback to WebP
            if (targetFormat === "image/avif") {
              createBlob("image/webp", qualityParam).then((webpResult) => {
                if (webpResult) {
                  resolve(webpResult);
                } else {
                  // Final fallback: return original
                  resolve(blob);
                }
              });
              return;
            }
            
            // For other formats that fail, return original
            resolve(blob);
          });
          
        } catch (err) {
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
 * Uses progressive downscaling for large images to avoid mobile memory issues.
 * Mobile-safe with dimension clamping.
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
        try {
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions based on user settings
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
          
          // Apply mobile-safe dimension limits
          const clamped = clampDimensions(width, height);
          width = clamped.width;
          height = clamped.height;
          
          // Use progressive downscaling for very large source images
          // This prevents memory issues on mobile devices
          let sourceCanvas: HTMLCanvasElement | HTMLImageElement = img;
          const sourceWidth = img.width;
          const sourceHeight = img.height;
          
          // If source is much larger than target, scale in steps
          if (sourceWidth > width * 2 || sourceHeight > height * 2) {
            const steps = Math.ceil(Math.log2(Math.max(sourceWidth / width, sourceHeight / height)));
            let currentWidth = sourceWidth;
            let currentHeight = sourceHeight;
            let currentSource: HTMLCanvasElement | HTMLImageElement = img;
            
            for (let i = 0; i < steps - 1; i++) {
              currentWidth = Math.max(width, Math.floor(currentWidth / 2));
              currentHeight = Math.max(height, Math.floor(currentHeight / 2));
              
              const stepCanvas = document.createElement("canvas");
              stepCanvas.width = currentWidth;
              stepCanvas.height = currentHeight;
              const stepCtx = stepCanvas.getContext("2d");
              
              if (!stepCtx) {
                console.warn("Progressive resize step failed, using direct resize");
                break;
              }
              
              stepCtx.imageSmoothingEnabled = true;
              stepCtx.imageSmoothingQuality = "high";
              stepCtx.drawImage(currentSource, 0, 0, currentWidth, currentHeight);
              
              currentSource = stepCanvas;
            }
            sourceCanvas = currentSource;
          }
          
          // Final canvas at target dimensions
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Your device ran out of memory. Try a smaller image or close other apps."));
            return;
          }
          
          // Maximum quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          
          // Draw from source (either original or progressive step)
          ctx.drawImage(sourceCanvas, 0, 0, width, height);
          
          // Preserve original format to maintain transparency and quality
          // Use PNG for any format that might have transparency
          const hasAlphaFormat = ["image/png", "image/webp", "image/avif"].includes(file.type);
          const outputFormat = hasAlphaFormat ? "image/png" : "image/jpeg";
          const quality = outputFormat === "image/png" ? undefined : 0.92;
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image processing failed. Try a smaller image."));
          }, outputFormat, quality);
          
        } catch (err) {
          console.error("Resize error:", err);
          reject(new Error("Image too large for this device. Try a smaller image."));
        }
      };
      img.onerror = () => reject(new Error("Could not read this image file."));
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
  const [settings, setSettings] = useState<CompressionSettings>({
    ...PRESETS[0].settings,
    enableCompression: true
  });
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
      
      // Separate Resize and Compression logic
      // If compression is disabled, we use maximum quality (1.0) and skip mapping
      const isCompressionEnabled = settings.enableCompression !== false;
      
      if (!isCompressionEnabled) {
        mappedQuality = 1.0;
      } else {
        // CRITICAL: Enforce minimum quality thresholds only when compression is enabled
        if (isText) {
          // Text/documents: never below 0.80 (80%)
          mappedQuality = Math.max(mappedQuality, 0.80);
        } else {
          // Photos: never below 0.70 (70%)
          mappedQuality = Math.max(mappedQuality, 0.70);
        }
      }
      
      const finalQuality = mappedQuality;
      
      // Select best format - RESPECTS user choice
      const bestFormat = selectFormat(isText, settings.format, hasTransparency);
      const needsFormatChange = bestFormat !== originalFile.type;
      const needsResize = !!(settings.width || settings.height);
      
      setProgress(30);

      // TRACK THE SMALLEST BLOB - start with original as baseline
      let smallestBlob: Blob = originalFile;
      
      // RUN RESIZE if requested (independent of compression)
      let fileToProcess: File | Blob = originalFile;
      if (needsResize) {
        fileToProcess = await resizeImage(
          originalFile, 
          settings.width, 
          settings.height, 
          settings.maintainAspectRatio
        );
        smallestBlob = fileToProcess;
      }

      // ONLY run compression library if enabled
      if (isCompressionEnabled && (needsResize || settings.quality < 100)) {
        const options = {
          maxSizeMB: 50,
          maxWidthOrHeight: settings.width || settings.height || undefined,
          useWebWorker: true,
          initialQuality: finalQuality,
          fileType: bestFormat,
          onProgress: (p: number) => setProgress(Math.round(30 + (p * 0.5))),
        };

        const compressed = await imageCompression(fileToProcess as File, options);
        
        // Only use compressed if it's actually smaller (or resize was requested)
        if (compressed.size < smallestBlob.size || needsResize) {
          smallestBlob = compressed;
        }
      }
      
      setProgress(80);

      // Only run forceConvertFormat if we NEED a format change
      // This avoids destroying PNG optimizations when no change is needed
      if (needsFormatChange || (!isCompressionEnabled && needsResize)) {
        // If compression is off, forceConvertFormat preserves the resized blob at max quality
        const converted = await forceConvertFormat(smallestBlob, bestFormat, finalQuality);
        smallestBlob = converted;
      }
      
      setProgress(90);
      
      // FINAL PROTECTION: Never output larger than input unless resize/format change/explicit compression requested
      let finalBlob: Blob = smallestBlob;
      if (!needsResize && !needsFormatChange && isCompressionEnabled && finalBlob.size > originalFile.size) {
        finalBlob = originalFile;
      }
      
      // Update the extension if format changed - must match MIME type exactly
      const getExtension = (mime: string): string => {
        switch (mime) {
          case "image/png": return "png";
          case "image/webp": return "webp";
          case "image/avif": return "avif";
          case "image/jpeg": return "jpg";
          default: return "jpg";
        }
      };
      
      // VALIDATE: Ensure blob has valid type before download
      const blobType = finalBlob.type || "image/jpeg";
      const baseName = originalFile.name.replace(/\.[^/.]+$/, "");
      const finalName = `${baseName}.${getExtension(blobType)}`;

      // Create file with validated MIME type
      setCompressedFile(new File([finalBlob], finalName, {
        type: blobType,
        lastModified: Date.now(),
      }));
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(finalBlob));
      
      setProgress(100);
    } catch (error) {
      console.error("Compression error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      
      // Provide helpful mobile-specific error messages
      let description = errorMessage;
      if (errorMessage.includes("memory") || errorMessage.includes("context")) {
        description = "This image is too large for your device. Try closing other apps or using a smaller image.";
      } else if (errorMessage.includes("too large")) {
        description = "Image exceeds device limits. Try a smaller image (under 4000px).";
      }
      
      toast({
        title: "Processing failed",
        description,
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
