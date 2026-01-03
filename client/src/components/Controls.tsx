import { type CompressionSettings, type CompressionFormat } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, Smartphone, Monitor, Mail, FileText, Info, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}

const PRESETS = [
  { 
    id: "safe", 
    name: "Safe (Recommended)", 
    icon: Monitor,
    settings: { quality: 70, format: "image/jpeg", maintainAspectRatio: true, stripMetadata: true } 
  },
  { 
    id: "balanced", 
    name: "Balanced", 
    icon: Smartphone,
    settings: { quality: 55, format: "image/webp", maintainAspectRatio: true, stripMetadata: true } 
  },
  { 
    id: "aggressive", 
    name: "Aggressive", 
    icon: FileText,
    settings: { quality: 40, format: "image/webp", width: 1600, maintainAspectRatio: true, stripMetadata: true } 
  },
  { 
    id: "maximum", 
    name: "Maximum", 
    icon: Mail,
    settings: { quality: 30, format: "image/webp", width: 1200, maintainAspectRatio: true, stripMetadata: true } 
  },
  {
    id: "custom",
    name: "Custom",
    icon: Settings2,
    settings: null
  }
] as const;

export function Controls({ settings, onChange }: ControlsProps) {
  const activePreset = PRESETS.find(p => {
    if (p.id === "custom") return false;
    const s = p.settings as any;
    return s.quality === settings.quality && 
           s.format === settings.format && 
           s.maintainAspectRatio === settings.maintainAspectRatio &&
           s.stripMetadata === settings.stripMetadata &&
           s.width === settings.width;
  })?.id || "custom";

  const handlePresetChange = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset && preset.settings) {
      onChange({
        ...settings,
        ...preset.settings
      });
    }
  };

  const updateSetting = (newSettings: Partial<CompressionSettings>) => {
    onChange({ ...settings, ...newSettings });
  };

  return (
    <div className="space-y-6">
      {/* Section A: Usage Mode (Presets) */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Usage Mode
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all hover-elevate",
                  isActive 
                    ? "border-primary bg-primary/5 text-primary shadow-sm" 
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold leading-tight">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Section B: Fine-Tuning (Quality & Format) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">Fine-Tuning</span>
        </div>
        
        {/* Quality Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality-slider" className="font-semibold">Quality</Label>
            <span className="bg-primary text-white px-2 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
              {settings.quality}%
            </span>
          </div>
          <div className="relative pt-2">
            <Slider
              id="quality-slider"
              value={[settings.quality]}
              min={1}
              max={100}
              step={1}
              onValueChange={([val]) => updateSetting({ quality: val })}
              className="[&_.relative]:h-2 [&_.absolute]:bg-gradient-to-r [&_.absolute]:from-red-500 [&_.absolute]:via-yellow-500 [&_.absolute]:to-green-500"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            <span>Low</span>
            <span>Balanced</span>
            <span>Best</span>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Label className="font-semibold">Output Format</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  WebP usually reduces image size by 30–80% with no visible quality loss.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={settings.format} 
            onValueChange={(val: CompressionFormat) => updateSetting({ format: val })}
          >
            <SelectTrigger className="w-full bg-background border-border shadow-sm h-10">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image/jpeg">JPEG</SelectItem>
              <SelectItem value="image/png">PNG</SelectItem>
              <SelectItem value="image/webp">WebP</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            WebP/AVIF recommended for web.
          </p>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Section C: Dimensions & Privacy */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">Dimensions & Privacy</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex flex-col gap-0.5 cursor-pointer" htmlFor="resize-toggle">
              <span className="font-semibold">Resize Image</span>
              <span className="text-xs text-muted-foreground font-normal leading-tight">
                Optimize dimensions for specific use cases
              </span>
            </Label>
            <Switch 
              id="resize-toggle"
              checked={!!settings.width}
              onCheckedChange={(checked) => updateSetting({ width: checked ? 1600 : undefined })}
            />
          </div>

          <AnimatePresence>
            {!!settings.width && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/50">
                    <div className="space-y-2">
                      <Label htmlFor="max-width" className="text-xs font-bold">Max Width (px)</Label>
                      <input
                        id="max-width"
                        type="number"
                        placeholder="e.g. 1920"
                        min="1"
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={settings.width || ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          if (!val || val > 0) updateSetting({ width: val });
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold cursor-pointer" htmlFor="aspect">
                        Maintain Aspect Ratio
                      </Label>
                      <Switch 
                        id="aspect"
                        checked={settings.maintainAspectRatio}
                        onCheckedChange={(checked) => updateSetting({ maintainAspectRatio: checked })}
                        className="scale-75 origin-right"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Label className="font-semibold cursor-pointer" htmlFor="metadata">
                  Strip Metadata
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">
                      Removes hidden data like location (GPS) and camera details to improve privacy.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-xs text-muted-foreground font-normal leading-tight">
                Removes EXIF data to save space
              </span>
            </div>
            <Switch 
              id="metadata"
              checked={settings.stripMetadata}
              onCheckedChange={(checked) => updateSetting({ stripMetadata: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-t", className)} />;
}
