import { type CompressionSettings, type CompressionFormat } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, Smartphone, Monitor, Mail, FileText, Info, HelpCircle, Maximize, Scissors } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ResizeControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}

export function ResizeControls({ settings, onChange }: ResizeControlsProps) {
  const updateSetting = (newSettings: Partial<CompressionSettings>) => {
    onChange({ ...settings, ...newSettings });
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Dimensions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Maximize className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">Resize Settings</span>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-xs font-bold">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder="Auto"
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
                placeholder="Auto"
                className="h-10 bg-background opacity-50 cursor-not-allowed"
                disabled
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

      {/* Section 2: Export Settings (Compression) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">Export Settings</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
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
