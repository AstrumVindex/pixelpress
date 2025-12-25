import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          {...getRootProps()}
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-3xl p-10 md:p-16
            transition-all duration-300 ease-out
            bg-white/50 hover:bg-white/80 backdrop-blur-sm
            text-center
            ${isDragActive 
              ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/10' 
              : 'border-border hover:border-primary/50 shadow-lg hover:shadow-xl shadow-black/5'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={`
              p-5 rounded-2xl bg-white shadow-md border border-border/50
              transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3
            `}>
              {isDragActive ? (
                <FileUp className="w-10 h-10 text-primary animate-bounce" />
              ) : (
                <UploadCloud className="w-10 h-10 text-primary" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-display font-semibold text-foreground">
                {isDragActive ? "Drop it like it's hot!" : "Upload an image"}
              </h3>
              <p className="text-muted-foreground text-base max-w-sm mx-auto">
                Drag and drop your image here, or click to browse.
                <br />
                <span className="text-xs uppercase tracking-wider font-medium opacity-60 mt-2 block">
                  Supports JPG, PNG, WEBP
                </span>
              </p>
            </div>

            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 mt-2">
              Select Image
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "No Uploads", desc: "100% Client-side" },
            { label: "Unlimited", desc: "No file size limits" },
            { label: "Lightning Fast", desc: "Instant compression" }
          ].map((item, i) => (
            <div key={i} className="bg-white/40 p-3 rounded-xl border border-white/20">
              <div className="font-semibold text-sm text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
