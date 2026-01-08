import { useState, useCallback, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import { type CompressionSettings, PRESETS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CompressedFileItem {
  id: string;
  original: File;
  compressed: Blob | null;
  name: string;
  status: 'pending' | 'compressing' | 'done' | 'error';
  originalSize: number;
  compressedSize: number;
  saved: string;
  previewUrl: string | null;
}

export function useImageCompressor(isResizeOnly = false) {
  // All hooks must be called unconditionally at the top
  const { toast } = useToast();
  
  // Bulk mode state
  const [files, setFiles] = useState<CompressedFileItem[]>([]);
  
  // Single file mode state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  
  // Common state
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<CompressionSettings>(() => ({
    ...PRESETS[0].settings,
    enableCompression: !isResizeOnly
  }));
  
  // Ref to access current settings in async functions
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // REF to track active URLs prevents "Network Error" bugs
  const activeUrls = useRef(new Set<string>());

  const createSafeUrl = useCallback((blob: Blob | File) => {
    const url = URL.createObjectURL(blob);
    activeUrls.current.add(url);
    return url;
  }, []);
  
  // Ref to track if we should re-process on settings change
  const isResizeModeRef = useRef(isResizeOnly);
  isResizeModeRef.current = isResizeOnly;

  // Bulk file handler for compression pages - uses current settings
  const handleFiles = useCallback(async (newFileList: FileList | File[]) => {
    const incomingFiles = Array.from(newFileList);
    if (incomingFiles.length === 0) return;

    const fileQueue: CompressedFileItem[] = incomingFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      original: file,
      compressed: null,
      name: file.name,
      status: 'pending' as const,
      originalSize: file.size,
      compressedSize: 0,
      saved: '0',
      previewUrl: null
    }));
    
    setFiles(prev => [...prev, ...fileQueue]);
    setIsCompressing(true);

    // Sequential processing for mobile stability
    for (const fileItem of fileQueue) {
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'compressing' as const } : f));

      try {
        // Use current settings from ref
        const currentSettings = settingsRef.current;
        const quality = currentSettings.quality / 100;
        
        const options = {
          maxSizeMB: currentSettings.enableCompression ? 1 : 10,
          maxWidthOrHeight: currentSettings.width || currentSettings.height || 1920,
          useWebWorker: true,
          initialQuality: quality,
          fileType: currentSettings.format as string,
        };
        
        const compressedBlob = await imageCompression(fileItem.original, options);
        const url = createSafeUrl(compressedBlob);
        
        setFiles(prev => prev.map(f => {
          if (f.id === fileItem.id) {
            return {
              ...f,
              status: 'done' as const,
              compressed: compressedBlob,
              previewUrl: url,
              compressedSize: compressedBlob.size,
              saved: ((f.originalSize - compressedBlob.size) / f.originalSize * 100).toFixed(1)
            };
          }
          return f;
        }));
      } catch (error) {
        console.error("Compression failed for", fileItem.name, error);
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error' as const } : f));
      }
    }
    setIsCompressing(false);
  }, []);

  // Single file handler for resize page
  const handleFileSelect = useCallback(async (file: File) => {
    setOriginalFile(file);
    setOriginalPreviewUrl(createSafeUrl(file));
    setIsCompressing(true);
    setProgress(0);

    try {
      const currentSettings = settingsRef.current;
      const quality = currentSettings.enableCompression ? currentSettings.quality / 100 : 1;
      
      const options = {
        maxSizeMB: isResizeModeRef.current ? 10 : 1,
        maxWidthOrHeight: currentSettings.width || currentSettings.height || 1920,
        useWebWorker: true,
        initialQuality: quality,
        fileType: currentSettings.format as string,
        onProgress: (p: number) => setProgress(p)
      };
      
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
      setPreviewUrl(createSafeUrl(compressed));
    } catch (error) {
      console.error("Compression failed", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process image"
      });
    } finally {
      setIsCompressing(false);
    }
  }, [toast]);

  // Re-process single file when settings change (for resize page)
  useEffect(() => {
    if (originalFile && isResizeModeRef.current) {
      handleFileSelect(originalFile);
    }
  }, [settings.width, settings.height, settings.enableCompression, settings.quality, settings.format]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
        activeUrls.current.delete(file.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    // Clean up bulk files
    setFiles(prev => {
      prev.forEach(f => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
          activeUrls.current.delete(f.previewUrl);
        }
      });
      return [];
    });
    
    // Clean up single file
    setOriginalFile(null);
    setCompressedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      activeUrls.current.delete(previewUrl);
    }
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
      activeUrls.current.delete(originalPreviewUrl);
    }
    setPreviewUrl(null);
    setOriginalPreviewUrl(null);
    setIsCompressing(false);
    setProgress(0);
  }, [previewUrl, originalPreviewUrl]);

  // Cleanup on unmount (User leaves page)
  useEffect(() => {
    return () => {
      activeUrls.current.forEach(url => URL.revokeObjectURL(url));
      activeUrls.current.clear();
    };
  }, []);

  return {
    // Bulk mode
    files,
    handleFiles,
    removeFile,
    
    // Single file mode (for resize page)
    originalFile,
    compressedFile,
    previewUrl,
    originalPreviewUrl,
    handleFileSelect,
    progress,
    
    // Common
    isCompressing,
    settings,
    setSettings,
    reset
  };
}
