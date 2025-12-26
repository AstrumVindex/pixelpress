import { useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface ComparisonViewProps {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  isCompressing: boolean;
  onDownload: () => void;
  onReset: () => void;
}

export function ComparisonView({
  originalUrl,
  compressedUrl,
  originalSize,
  compressedSize,
  isCompressing,
  onDownload,
  onReset
}: ComparisonViewProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const savings = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;
  const isSavingsPositive = savings > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/50 p-4 rounded-2xl border border-white/20 text-center">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Original</div>
          <div className="text-lg font-bold font-display">{formatSize(originalSize)}</div>
        </div>
        <div className="bg-white/50 p-4 rounded-2xl border border-white/20 text-center relative overflow-hidden">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Compressed</div>
          <div className="text-lg font-bold font-display text-primary">{formatSize(compressedSize)}</div>
          {isCompressing && (
            <motion.div 
              className="absolute inset-x-0 bottom-0 h-1 bg-primary"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          )}
        </div>
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center col-span-2 md:col-span-1">
          <div className="text-xs text-primary/80 uppercase font-bold tracking-wider mb-1">Saved</div>
          <div className={`text-lg font-bold font-display ${isSavingsPositive ? 'text-green-600' : 'text-orange-500'}`}>
            {isSavingsPositive ? `-${savings.toFixed(1)}%` : '+0%'}
          </div>
        </div>
      </div>

      {/* Comparison Slider */}
      <div className="relative w-full aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-black/10 select-none group border border-border">
        {/* Compressed Image (Background) */}
        <img 
          src={compressedUrl} 
          alt="Compressed" 
          className="absolute inset-0 w-full h-full object-contain"
        />
        <Badge className="absolute top-4 right-4 z-10 bg-primary/90 hover:bg-primary pointer-events-none">Compressed</Badge>

        {/* Original Image (Clipped by slider position) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={originalUrl} 
            alt="Original" 
            className="w-full h-full object-contain"
          />
          <Badge className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 backdrop-blur-md pointer-events-none text-white border-0">Original</Badge>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary">
            <div className="flex gap-0.5">
              <ArrowLeft className="w-3 h-3" />
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Touch/Mouse Area for Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0 appearance-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onReset}
          className="flex-1 rounded-xl h-14 text-base hover:bg-muted/50 border-2"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button 
          size="lg" 
          onClick={onDownload}
          disabled={isCompressing || !isSavingsPositive}
          className={`
            flex-[2] rounded-xl h-14 text-base font-semibold shadow-lg shadow-primary/25
            transition-all hover:-translate-y-0.5 active:translate-y-0
            ${isCompressing ? 'opacity-80' : ''}
          `}
        >
          {isCompressing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Compressing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download {formatSize(compressedSize)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
