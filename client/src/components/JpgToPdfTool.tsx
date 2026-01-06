import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, X, Check, FileText, Download, Zap, ImageIcon, Maximize2, Minimize2, AlignCenter, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface JpgFile {
  file: File;
  previewUrl: string;
  id: string;
  name: string;
}

interface PdfOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter';
  margin: 'no' | 'small' | 'big';
  merge: boolean;
}

export function JpgToPdfTool() {
  const [files, setFiles] = useState<JpgFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultFiles, setResultFiles] = useState<{ name: string; blob: Blob; url: string }[]>([]);
  const [options, setOptions] = useState<PdfOptions>({
    orientation: 'portrait',
    pageSize: 'a4',
    margin: 'no',
    merge: true,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
      resultFiles.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, [files, resultFiles]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(file => file.type === 'image/jpeg' || file.type === 'image/jpg');
    
    if (validFiles.length < Array.from(newFiles).length) {
      toast({
        variant: "destructive",
        title: "Invalid files skipped",
        description: "Only JPG/JPEG images are allowed."
      });
    }

    const newJpgFiles: JpgFile[] = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name
    }));

    setFiles(prev => [...prev, ...newJpgFiles]);
  }, [toast]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);

    try {
      const marginMap = { no: 0, small: 10, big: 30 };
      const margin = marginMap[options.margin];
      
      if (options.merge) {
        const doc = new jsPDF({
          orientation: options.orientation,
          unit: 'pt',
          format: options.pageSize
        });

        for (let i = 0; i < files.length; i++) {
          if (i > 0) doc.addPage();
          
          const img = new Image();
          img.src = files[i].previewUrl;
          await new Promise(r => img.onload = r);

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          const innerWidth = pageWidth - (margin * 2);
          const innerHeight = pageHeight - (margin * 2);
          
          const ratio = Math.min(innerWidth / img.width, innerHeight / img.height);
          const drawWidth = img.width * ratio;
          const drawHeight = img.height * ratio;
          
          const x = (pageWidth - drawWidth) / 2;
          const y = (pageHeight - drawHeight) / 2;

          doc.addImage(img, 'JPEG', x, y, drawWidth, drawHeight);
        }

        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setResultFiles([{ name: 'merged-document.pdf', blob: pdfBlob, url }]);
      } else {
        const results = [];
        for (const fileItem of files) {
          const doc = new jsPDF({
            orientation: options.orientation,
            unit: 'pt',
            format: options.pageSize
          });

          const img = new Image();
          img.src = fileItem.previewUrl;
          await new Promise(r => img.onload = r);

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const innerWidth = pageWidth - (margin * 2);
          const innerHeight = pageHeight - (margin * 2);
          
          const ratio = Math.min(innerWidth / img.width, innerHeight / img.height);
          const drawWidth = img.width * ratio;
          const drawHeight = img.height * ratio;
          
          const x = (pageWidth - drawWidth) / 2;
          const y = (pageHeight - drawHeight) / 2;

          doc.addImage(img, 'JPEG', x, y, drawWidth, drawHeight);
          
          const pdfBlob = doc.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          results.push({ 
            name: fileItem.file.name.replace(/\.(jpg|jpeg)$/i, '.pdf'), 
            blob: pdfBlob, 
            url 
          });
        }
        setResultFiles(results);
      }
      setIsDone(true);
      toast({ title: "Success", description: "Images converted to PDF successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Conversion failed", description: "Something went wrong." });
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setIsDone(false);
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    resultFiles.forEach(f => URL.revokeObjectURL(f.url));
    setFiles([]);
    setResultFiles([]);
  };

  const getPaperStyles = () => {
    const aspectRatio = options.orientation === 'portrait' ? 'aspect-[210/297]' : 'aspect-[297/210]';
    let padding = 'p-0';
    if (options.margin === 'small') padding = 'p-4';
    if (options.margin === 'big') padding = 'p-8';
    return { aspectRatio, padding };
  };

  if (isDone) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">Conversion Complete!</h2>
            <p className="text-muted-foreground">Your PDF files are ready for download.</p>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {resultFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-border/50 shadow-sm hover-elevate group">
                <div className="flex items-center gap-4 text-left min-w-0">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.blob.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-full px-6">
                  <a href={file.url} download={file.name}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={reset} className="w-full rounded-2xl h-14 text-lg font-bold">
              Convert More Images
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const { aspectRatio, padding } = getPaperStyles();

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 w-full space-y-6">
        <div className={`
          bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-border/50 min-h-[35rem] shadow-xl
          ${isDragging ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        >
          {files.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[28rem] flex flex-col items-center justify-center text-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-border/50 mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">Upload JPG Images</h3>
              <p className="text-muted-foreground mb-8">Drag and drop your images here or click to browse</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple 
                accept="image/jpeg, image/jpg" 
                onChange={(e) => handleFiles(e.target.files)} 
              />
              <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20">
                Select Files
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-display font-bold text-slate-700 dark:text-slate-300">Live Preview ({files.length} pages)</h3>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-red-500 hover:text-red-600 font-bold">
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <AnimatePresence>
                  {files.map((file) => (
                    <motion.div 
                      key={file.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group"
                    >
                      <div className={`bg-white dark:bg-slate-800 shadow-lg rounded-sm transition-all duration-300 ease-in-out relative border border-border/20 ${aspectRatio} ${padding}`}>
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden border border-border/10">
                          <img 
                            src={file.previewUrl} 
                            alt="preview" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      </div>
                      
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-2 -right-2 rounded-full h-8 w-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X size={16} />
                      </Button>
                      <p className="mt-3 text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest truncate px-2">{file.name}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <motion.button 
                  layout
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group ${aspectRatio}`}
                >
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground mt-3 uppercase tracking-wider">Add Page</span>
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/jpeg, image/jpg" onChange={(e) => handleFiles(e.target.files)} />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 w-full sticky top-24">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Zap size={20} className="fill-current" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">PDF Options</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Orientation</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={options.orientation === 'portrait' ? 'default' : 'outline'}
                  onClick={() => setOptions({...options, orientation: 'portrait'})}
                  className="rounded-xl h-12 font-bold"
                >
                  <div className="w-3 h-4 border-2 border-current rounded-sm mr-2 opacity-70"></div>
                  Portrait
                </Button>
                <Button 
                  variant={options.orientation === 'landscape' ? 'default' : 'outline'}
                  onClick={() => setOptions({...options, orientation: 'landscape'})}
                  className="rounded-xl h-12 font-bold"
                >
                  <div className="w-4 h-3 border-2 border-current rounded-sm mr-2 opacity-70"></div>
                  Landscape
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Page Size</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={options.pageSize === 'a4' ? 'default' : 'outline'}
                  onClick={() => setOptions({...options, pageSize: 'a4'})}
                  className="rounded-xl h-12 font-bold"
                >
                  A4
                </Button>
                <Button 
                  variant={options.pageSize === 'letter' ? 'default' : 'outline'}
                  onClick={() => setOptions({...options, pageSize: 'letter'})}
                  className="rounded-xl h-12 font-bold"
                >
                  Letter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Margins</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'no', icon: <Maximize2 size={16}/>, label: 'No' },
                  { id: 'small', icon: <Minimize2 size={16}/>, label: 'Small' },
                  { id: 'big', icon: <AlignCenter size={16}/>, label: 'Big' },
                ].map((m) => (
                  <Button 
                    key={m.id}
                    variant={options.margin === m.id ? 'default' : 'outline'}
                    onClick={() => setOptions({...options, margin: m.id as any})}
                    className="rounded-xl h-12 flex flex-col items-center gap-1 font-bold"
                  >
                    {m.icon}
                    <span className="text-[10px] uppercase">{m.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setOptions({...options, merge: !options.merge})}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-full border border-border/40 hover-elevate transition-all"
              >
                <div className={`
                  w-6 h-6 rounded-lg flex items-center justify-center transition-all
                  ${options.merge ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border border-border'}
                `}>
                  {options.merge && <Check size={14} strokeWidth={4} />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-foreground block">Merge into one PDF</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Combine all images</span>
                </div>
              </button>
            </div>
          </div>

          <Button 
            onClick={handleConvert} 
            disabled={files.length === 0 || isConverting} 
            className="w-full h-16 rounded-2xl text-xl font-display font-extrabold shadow-2xl shadow-primary/25"
          >
            {isConverting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating PDF...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Layers size={22} className="fill-current" />
                <span>Convert to PDF</span>
              </div>
            )}
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
            Privacy Secure • Local Processing
          </p>
        </div>
      </div>
    </div>
  );
}
