import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Scissors, Lock, Unlock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string | null;
  onCropComplete: (croppedImage: Blob) => void;
}

const ASPECT_RATIOS = [
  { label: "Freeform", value: "free" },
  { label: "1:1 (Square)", value: "1" },
  { label: "4:5 (Portrait)", value: "0.8" },
  { label: "16:9 (Landscape)", value: "1.777" },
  { label: "3:2 (Camera)", value: "1.5" },
];

export function CropDialog({ open, onOpenChange, image, onCropComplete }: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [selectedRatio, setSelectedRatio] = useState("free");
  const [isLocked, setIsLocked] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    if (selectedRatio === "free") {
      setAspect(undefined);
    } else {
      setAspect(Number(selectedRatio));
    }
  }, [selectedRatio]);

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  
  const onCropCompleteCallback = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("No 2d context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      // Use PNG to preserve quality and transparency if it exists
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Canvas is empty"));
        else resolve(blob);
      }, "image/png");
    });
  };

  const handleSave = async () => {
    if (image && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
        onCropComplete(croppedBlob);
        onOpenChange(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Crop Image
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Aspect Ratio" />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Toggle 
                aria-label="Lock aspect ratio"
                pressed={isLocked}
                onPressedChange={setIsLocked}
                className="h-9 w-9 p-0"
                disabled={selectedRatio === "free"}
              >
                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Toggle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="relative flex-1 bg-slate-900">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={isLocked ? aspect : undefined}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
              classes={{
                containerClassName: "bg-slate-900",
              }}
            />
          )}
        </div>

        <DialogFooter className="p-6 border-t flex flex-col sm:flex-row gap-6 shrink-0 bg-white dark:bg-slate-950">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={([val]) => setZoom(val)}
              className="py-4"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-11">
              Cancel
            </Button>
            <Button onClick={handleSave} className="px-8 h-11 shadow-lg shadow-primary/20">
              Apply Crop
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
