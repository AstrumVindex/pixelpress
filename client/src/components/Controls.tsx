import { PRESETS, type CompressionSettings, type CompressionFormat } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, Smartphone, Monitor, Mail, FileText } from "lucide-react";

interface ControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}

const PresetIcons = {
  web: Monitor,
  social: Smartphone,
  documents: FileText,
  email: Mail,
};

export function Controls({ settings, onChange }: ControlsProps) {
  
  const handlePresetChange = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChange(preset.settings);
    }
  };

  const currentPresetId = PRESETS.find(
    p => JSON.stringify(p.settings) === JSON.stringify(settings)
  )?.id || "custom";

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
          Quick Presets
        </Label>
        <Tabs value={currentPresetId} onValueChange={handlePresetChange} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
            {PRESETS.map((preset) => {
              const Icon = PresetIcons[preset.id as keyof typeof PresetIcons] || Settings2;
              return (
                <TabsTrigger 
                  key={preset.id} 
                  value={preset.id}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{preset.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Custom Settings</span>
        </div>
        <CardContent className="p-5 space-y-6">
          {/* Quality Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Quality</Label>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold font-mono">
                {settings.quality}%
              </span>
            </div>
            <Slider
              value={[settings.quality]}
              min={1}
              max={100}
              step={1}
              onValueChange={([val]) => onChange({ ...settings, quality: val })}
              className="[&_.relative]:h-2 [&_.absolute]:bg-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
              <span>Low</span>
              <span>Balanced</span>
              <span>Best</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Format</Label>
              <Select 
                value={settings.format} 
                onValueChange={(val: CompressionFormat) => onChange({ ...settings, format: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Width */}
            <div className="space-y-2">
              <Label>Max Width (px)</Label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Auto"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.width || ""}
                  onChange={(e) => onChange({ ...settings, width: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-0.5 cursor-pointer" htmlFor="aspect">
                <span>Maintain Aspect Ratio</span>
                <span className="text-xs text-muted-foreground font-normal">Prevents image distortion</span>
              </Label>
              <Switch 
                id="aspect"
                checked={settings.maintainAspectRatio}
                onCheckedChange={(checked) => onChange({ ...settings, maintainAspectRatio: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-0.5 cursor-pointer" htmlFor="metadata">
                <span>Strip Metadata</span>
                <span className="text-xs text-muted-foreground font-normal">Removes EXIF data to save space</span>
              </Label>
              <Switch 
                id="metadata"
                checked={settings.stripMetadata}
                onCheckedChange={(checked) => onChange({ ...settings, stripMetadata: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
