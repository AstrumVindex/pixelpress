import { useState, useRef, useCallback, useEffect } from 'react';
import { CloudUpload, X, FileIcon, AlertCircle, Download, Zap, FileText, Images, Check, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { convertImageFormat, convertPdfToImages } from '@/utils/converterEngine';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SeoContent } from './SeoContent';
import { seoData } from '../data/seoContent';

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

interface FileConverterProps {
  inputFormat: string;
  outputFormat: string;
  seoKey?: string;
}

interface FileWithPreview {
  file: File;
  id: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  downloadUrl?: string;
  error?: string;
  convertedName?: string;
  size?: number;
}

export function FileConverter({ inputFormat, outputFormat, seoKey }: FileConverterProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progressTxt, setProgressTxt] = useState('Processing...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.downloadUrl) URL.revokeObjectURL(f.downloadUrl);
      });
    };
  }, [files]);

  const validateAndAddFiles = (newFiles: FileList) => {
    setError('');
    const validFiles: FileWithPreview[] = [];
    const invalidFiles: string[] = [];

    Array.from(newFiles).forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const expectedMime = MIME_TYPES[inputFormat.toLowerCase()];
      const inputFormatLower = inputFormat.toLowerCase();
      
      const isValidExtension = fileExtension === inputFormatLower || 
        (inputFormatLower === 'jpg' && fileExtension === 'jpeg') ||
        (inputFormatLower === 'jpeg' && fileExtension === 'jpg');
      const isValidMime = expectedMime && file.type === expectedMime;

      if (isValidExtension || isValidMime) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          status: 'pending'
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Only .${inputFormat.toUpperCase()} files are allowed. Skipped: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) validateAndAddFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) validateAndAddFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.downloadUrl) URL.revokeObjectURL(fileToRemove.downloadUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const resetAll = useCallback(() => {
    files.forEach(f => {
      if (f.downloadUrl) URL.revokeObjectURL(f.downloadUrl);
    });
    setFiles([]);
    setError('');
    setProgressTxt('Processing...');
    setIsDone(false);
  }, [files]);

  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgressTxt('Initializing...');

    try {
      let newProcessedFiles: FileWithPreview[] = [];

      for (const fileObj of files) {
        if (fileObj.status === 'done') {
          newProcessedFiles.push(fileObj);
          continue;
        }

        setProgressTxt(`Converting ${fileObj.file.name}...`);
        let results: FileWithPreview[] = [];
        const outFormat = outputFormat.toLowerCase();

        if (inputFormat.toLowerCase() === 'pdf') {
          const pdfImages = await convertPdfToImages(fileObj.file, outFormat);
          results = pdfImages.map(imgData => ({
            file: fileObj.file,
            id: `${imgData.name}-${Date.now()}-${Math.random()}`,
            convertedName: imgData.name,
            downloadUrl: URL.createObjectURL(imgData.blob),
            size: imgData.size,
            status: 'done'
          }));
        } else {
          const imgDataArray = await convertImageFormat(fileObj.file, outFormat);
          const imgData = imgDataArray[0];
          results = [{
            ...fileObj,
            convertedName: imgData.name,
            downloadUrl: URL.createObjectURL(imgData.blob),
            size: imgData.size,
            status: 'done'
          }];
        }
        newProcessedFiles = [...newProcessedFiles, ...results];
      }

      setFiles(newProcessedFiles);
      setIsDone(true);
      toast({
        title: "Conversion complete",
        description: "Files converted with high quality."
      });
    } catch (err: any) {
      console.error(err);
      setError('Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
      setProgressTxt('Done!');
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const promises = files.map(async (file) => {
        if (file.status === 'done' && file.downloadUrl) {
          const response = await fetch(file.downloadUrl);
          const blob = await response.blob();
          const fileName = file.convertedName || `${file.file.name.split('.')[0]}-converted.${outputFormat.toLowerCase()}`;
          zip.file(fileName, blob);
        }
      });

      await Promise.all(promises);
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `pixelpress_${inputFormat}_to_${outputFormat}.zip`);
    } catch (err) {
      console.error("Zip failed", err);
      setError("Failed to create ZIP file.");
    } finally {
      setIsZipping(false);
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
          {inputFormat.toUpperCase()} to {outputFormat.toUpperCase()}
        </h1>
        <p className="text-muted-foreground">
          High-quality conversion powered by our browser engine.
        </p>
      </motion.div>

      <div 
        className={`
          border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer
          bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl' : 'border-border'}
          ${error ? 'border-destructive/50 bg-destructive/5' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-border/50">
            <CloudUpload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Upload {inputFormat.toUpperCase()} Files</h3>
            <p className="text-muted-foreground mt-1">Drag and drop or click to browse</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileSelect}
            accept={`.${inputFormat},${MIME_TYPES[inputFormat.toLowerCase()] || ''}`}
            multiple 
          />
          <Button size="lg" className="rounded-full px-8" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Select Files
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3 text-sm border border-destructive/20">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground">Files ({files.length})</h4>
            <Button variant="ghost" size="sm" onClick={resetAll}>Clear All</Button>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((fileItem) => (
              <div 
                key={fileItem.id} 
                className={`
                  flex items-center justify-between p-4 rounded-xl border transition-all
                  ${fileItem.status === 'done' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-900 border-border'}
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fileItem.status === 'done' ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {fileItem.file.type === 'application/pdf' ? <FileText size={20} /> : <Images size={20} />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-foreground text-sm truncate">{fileItem.convertedName || fileItem.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fileItem.size ? (fileItem.size / 1024).toFixed(1) : (fileItem.file.size / 1024).toFixed(1)} KB
                      {fileItem.status === 'done' && <span className="ml-2 text-green-600 font-bold">Ready</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {fileItem.status === 'done' && fileItem.downloadUrl && (
                    <Button asChild size="sm" className="rounded-full">
                      <a href={fileItem.downloadUrl} download={fileItem.convertedName}>
                        <Download size={16} className="mr-1" /> Download
                      </a>
                    </Button>
                  )}
                  {!isConverting && (
                    <Button variant="ghost" size="icon" onClick={() => removeFile(fileItem.id)} className="rounded-full h-8 w-8">
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pendingCount > 0 && (
            <Button onClick={handleConvertAll} disabled={isConverting} size="lg" className="w-full rounded-xl h-14 text-lg font-bold shadow-xl shadow-primary/20">
              {isConverting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{progressTxt}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 fill-current" />
                  <span>Convert All ({pendingCount})</span>
                </div>
              )}
            </Button>
          )}

          {isDone && (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 space-y-4">
              <Check className="w-10 h-10 text-green-600 mx-auto" />
              <p className="font-bold text-green-700 dark:text-green-400">All files converted!</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="flex-1 rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
                >
                  {isZipping ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating ZIP...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Package size={20}/>
                      <span>Download All as ZIP</span>
                    </div>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={resetAll} 
                  className="flex-1 rounded-xl h-12 font-bold"
                >
                  Convert More
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {seoKey && seoData[seoKey as keyof typeof seoData] && (
        <div className="mt-12">
          <SeoContent data={seoData[seoKey as keyof typeof seoData] as any} />
        </div>
      )}
    </div>
  );
}
