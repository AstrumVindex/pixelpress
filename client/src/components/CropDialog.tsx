import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Scissors } from "lucide-react";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string | null;
  onCropComplete: (croppedImage: Blob) => void;
}

export function CropDialog({ open, onOpenChange, image, onCropComplete }: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Canvas is empty"));
        else resolve(blob);
      }, "image/jpeg");
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
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Crop Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 bg-muted/20">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={undefined}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
            />
          )}
        </div>

        <DialogFooter className="p-6 border-t flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground uppercase">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([val]) => setZoom(val)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Apply Crop</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
