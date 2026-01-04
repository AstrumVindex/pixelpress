import { type CompressionSettings, type CompressionFormat } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings2, Maximize, Scissors, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ResizeControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  onOpenCrop?: () => void;
  originalDimensions?: { width: number; height: number };
}

export function ResizeControls({ settings, onChange, onOpenCrop, originalDimensions }: ResizeControlsProps) {
  const updateSetting = (newSettings: Partial<CompressionSettings>) => {
    onChange({ ...settings, ...newSettings });
  };

  const isUpscaling = originalDimensions && (
    (settings.width && settings.width > originalDimensions.width) ||
    (settings.height && settings.height > originalDimensions.height)
  );

  // Auto-disable compression during upscaling
  useEffect(() => {
    if (isUpscaling && settings.enableCompression !== false) {
      updateSetting({ enableCompression: false });
    }
  }, [isUpscaling, settings.enableCompression]);

  return (
    <div className="space-y-8">
      {/* Section 1: Dimensions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Resize Settings</span>
          </div>
          {onOpenCrop && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5"
              onClick={onOpenCrop}
            >
              <Scissors className="w-3.5 h-3.5" />
              Crop Tool
            </Button>
          )}
        </div>
        
        <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-xs font-bold">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder={originalDimensions?.width.toString() || "Auto"}
                value={settings.width || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  updateSetting({ width: val });
                }}
                className="h-10 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-xs font-bold">Height (px)</Label>
              <Input
                id="height"
                type="number"
                placeholder={originalDimensions?.height.toString() || "Auto"}
                value={settings.height || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  updateSetting({ height: val });
                }}
                className="h-10 bg-background"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label className="text-xs font-bold cursor-pointer" htmlFor="aspect">
              Lock Aspect Ratio
            </Label>
            <Switch 
              id="aspect"
              checked={settings.maintainAspectRatio}
              onCheckedChange={(checked) => updateSetting({ maintainAspectRatio: checked })}
              className="scale-90"
            />
          </div>

          {isUpscaling && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
                Compression is disabled during upscaling to avoid quality loss.
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Section 2: Export Settings (Compression) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Compression Settings</span>
          </div>
          <Switch 
            id="enable-compression"
            checked={!!settings.enableCompression}
            onCheckedChange={(checked) => updateSetting({ enableCompression: checked })}
            disabled={!!isUpscaling}
            className="scale-90"
          />
        </div>

        <AnimatePresence>
          {settings.enableCompression && !isUpscaling && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Quality</Label>
                  <span className="bg-primary text-white px-2 py-1 rounded-md text-xs font-bold font-mono">
                    {settings.quality}%
                  </span>
                </div>
                <Slider
                  value={[settings.quality]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([val]) => updateSetting({ quality: val })}
                  className="[&_.relative]:h-2"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs">Save Image As</Label>
                <Select 
                  value={settings.format} 
                  onValueChange={(val: CompressionFormat) => updateSetting({ format: val })}
                >
                  <SelectTrigger className="w-full bg-background border-border shadow-sm h-10">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPEG (Original)</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                    <SelectItem value="image/avif">AVIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!settings.enableCompression && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg">
            <Info className="w-3 h-3" />
            {isUpscaling ? "Disabled for upscaling" : "Resizing only (100% quality)"}
          </div>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Section 3: Privacy */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <Label className="font-semibold cursor-pointer" htmlFor="metadata-resize">
            Strip Metadata
          </Label>
          <span className="text-xs text-muted-foreground">Remove EXIF data</span>
        </div>
        <Switch 
          id="metadata-resize"
          checked={settings.stripMetadata}
          onCheckedChange={(checked) => updateSetting({ stripMetadata: checked })}
        />
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-t", className)} />;
}
