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
        </div>
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
