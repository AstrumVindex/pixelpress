import { useState, useRef, useCallback } from 'react';
import { CloudUpload, X, FileIcon, AlertCircle, Download, Zap, FileText, Images } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

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
}

interface FileWithPreview {
  file: File;
  id: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  downloadUrl?: string;
  error?: string;
  resultExtension?: string;
}

export function FileConverter({ inputFormat, outputFormat }: FileConverterProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progressTxt, setProgressTxt] = useState('Processing...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
  }, [files]);

  const convertImageToImage = async (file: File, format: string): Promise<Blob> => {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas error');

    if (format === 'jpeg' || format === 'jpg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(imageBitmap, 0, 0);

    return new Promise((resolve, reject) => {
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image conversion failed'));
      }, mimeType, 0.92);
    });
  };

  const convertImageToPdf = async (file: File): Promise<Blob> => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise(r => img.onload = r);

    const doc = new jsPDF({
      orientation: img.width > img.height ? 'l' : 'p',
      unit: 'px',
      format: [img.width, img.height]
    });
    
    const imgFormat = file.type.split('/')[1].toUpperCase();
    doc.addImage(img, imgFormat === 'JPEG' ? 'JPEG' : 'PNG', 0, 0, img.width, img.height);
    const pdfBlob = doc.output('blob');
    URL.revokeObjectURL(url);
    return pdfBlob;
  };

  const renderPageToBlob = async (pdf: any, pageNum: number): Promise<Blob | null> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error('Canvas context missing');
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  };

  const convertPdfToImages = async (file: File): Promise<{ blob: Blob; extension: string } | null> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    if (totalPages === 1) {
      const blob = await renderPageToBlob(pdf, 1);
      return blob ? { blob, extension: 'jpg' } : null;
    } else {
      const zip = new JSZip();
      for (let i = 1; i <= totalPages; i++) {
        setProgressTxt(`Rendering page ${i}/${totalPages}...`);
        const blob = await renderPageToBlob(pdf, i);
        if (blob) {
          const fileName = `page-${String(i).padStart(2, '0')}.jpg`;
          zip.file(fileName, blob);
        }
      }
      setProgressTxt('Compressing Zip...');
      const zipContent = await zip.generateAsync({ type: "blob" });
      return { blob: zipContent, extension: 'zip' };
    }
  };

  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgressTxt('Initializing...');

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const fileItem = updatedFiles[i];
      if (fileItem.status !== 'pending') continue;

      updatedFiles[i] = { ...fileItem, status: 'converting' };
      setFiles([...updatedFiles]);
      setProgressTxt(`Converting ${fileItem.file.name}...`);

      try {
        let resultBlob: Blob | null = null;
        let resultExtension: string = outputFormat.toLowerCase();
        const file = fileItem.file;
        const outFormat = outputFormat.toLowerCase();

        if (file.type === 'application/pdf') {
          const result = await convertPdfToImages(file);
          if (result) {
            resultBlob = result.blob;
            resultExtension = result.extension;
          }
        } else if (file.type.startsWith('image/')) {
          if (outFormat === 'pdf') {
            resultBlob = await convertImageToPdf(file);
            resultExtension = 'pdf';
          } else {
            resultBlob = await convertImageToImage(file, outFormat);
            resultExtension = outFormat === 'jpg' ? 'jpg' : outFormat;
          }
        }

        if (resultBlob) {
          const downloadUrl = URL.createObjectURL(resultBlob);
          updatedFiles[i] = { ...updatedFiles[i], status: 'done', downloadUrl, resultExtension };
        } else {
          throw new Error('Conversion returned empty result');
        }
      } catch (err: any) {
        updatedFiles[i] = { ...updatedFiles[i], status: 'error', error: err.message };
      }

      setFiles([...updatedFiles]);
    }

    setIsConverting(false);
    setProgressTxt('Done!');
    
    const successCount = updatedFiles.filter(f => f.status === 'done').length;
    if (successCount > 0) {
      toast({
        title: "Conversion complete",
        description: `${successCount} file(s) converted successfully.`
      });
    }
  };

  const getFileExtension = (fileItem: FileWithPreview) => {
    if (fileItem.resultExtension) {
      return fileItem.resultExtension;
    }
    const outFormat = outputFormat.toLowerCase();
    return outFormat === 'jpg' ? 'jpg' : outFormat;
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
          Strictly accepts <span className="font-bold text-primary">.{inputFormat.toUpperCase()}</span> files only. 
          Bulk upload supported.
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
        data-testid="dropzone-converter"
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
            data-testid="input-file-converter"
          />
          <Button 
            size="lg" 
            className="rounded-full px-8"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            data-testid="button-select-files"
          >
            Select Files
          </Button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3 text-sm border border-destructive/20"
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      {files.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground">Files ({files.length})</h4>
            <Button variant="ghost" size="sm" onClick={resetAll} data-testid="button-clear-all">
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {files.map((fileItem) => (
              <div 
                key={fileItem.id} 
                className={`
                  flex items-center justify-between p-4 rounded-xl border transition-all
                  ${fileItem.status === 'done' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
                  ${fileItem.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
                  ${fileItem.status === 'pending' || fileItem.status === 'converting' ? 'bg-white dark:bg-slate-900 border-border' : ''}
                `}
                data-testid={`file-item-${fileItem.id}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${fileItem.status === 'done' ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : ''}
                    ${fileItem.status === 'error' ? 'bg-red-100 dark:bg-red-900/50 text-red-600' : ''}
                    ${fileItem.status === 'pending' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : ''}
                    ${fileItem.status === 'converting' ? 'bg-primary/10 text-primary' : ''}
                  `}>
                    {fileItem.file.type === 'application/pdf' ? <FileText size={20} /> : <Images size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{fileItem.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(fileItem.file.size / 1024).toFixed(1)} KB
                      {fileItem.status === 'converting' && <span className="ml-2 text-primary animate-pulse">Converting...</span>}
                      {fileItem.status === 'done' && <span className="ml-2 text-green-600">Ready</span>}
                      {fileItem.status === 'error' && <span className="ml-2 text-red-600">{fileItem.error}</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {fileItem.status === 'done' && fileItem.downloadUrl && (
                    <Button 
                      asChild 
                      size="sm" 
                      className="rounded-full"
                      data-testid={`button-download-${fileItem.id}`}
                    >
                      <a 
                        href={fileItem.downloadUrl} 
                        download={`${fileItem.file.name.split('.')[0]}-converted.${getFileExtension(fileItem)}`}
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                  {!isConverting && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(fileItem.id)} 
                      className="rounded-full h-8 w-8"
                      data-testid={`button-remove-${fileItem.id}`}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pendingCount > 0 && (
            <Button 
              onClick={handleConvertAll}
              disabled={isConverting}
              size="lg"
              className="w-full rounded-xl h-14 text-lg font-bold shadow-xl shadow-primary/20"
              data-testid="button-convert-all"
            >
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

          {doneCount > 0 && pendingCount === 0 && !isConverting && (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <Download className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-700 dark:text-green-400">All files converted!</p>
              <p className="text-sm text-green-600 dark:text-green-500">Click download on each file above.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
