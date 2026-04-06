import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from "react-helmet";
import { CloudUpload, Zap, FileText, FileSpreadsheet, X, Images, Download, Lock, Table2, Gauge, BadgeDollarSign, Cpu } from 'lucide-react';
import { pdfjsLib } from '@/lib/pdfWorker';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'wouter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const features = [
  {
    icon: Lock,
    title: '100% Private & Secure',
    desc: 'Every conversion runs locally in your browser. Files never leave your device or hit a server.',
  },
  {
    icon: Table2,
    title: 'Multi-Format Support',
    desc: 'Convert between PDF, JPG, PNG, WebP, DOCX, and XLSX from one clean interface.',
  },
  {
    icon: Gauge,
    title: 'Fast Browser Processing',
    desc: 'No upload queue, no waiting for remote processing, and no account required to get results.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Unlimited Free Use',
    desc: 'Convert as many files as you need with no watermark, subscription wall, or hidden fee.',
  },
];

const steps = [
  {
    icon: CloudUpload,
    title: '1. Upload',
    desc: 'Choose a supported file such as PDF, image, Word, or Excel from the box above.',
  },
  {
    icon: Cpu,
    title: '2. Convert',
    desc: 'Select the output format and let PixelPress process everything directly in your browser.',
  },
  {
    icon: Download,
    title: '3. Download',
    desc: 'Save the converted file instantly, or download a ZIP automatically for multi-page PDF outputs.',
  },
];

const faqs = [
  {
    q: 'Is PixelPress converter safe to use for private documents?',
    a: 'Yes. PixelPress uses client-side processing, so your PDF, image, Word, and Excel files stay on your own device.',
  },
  {
    q: 'Which file types does the format converter support?',
    a: 'The general converter currently supports PDF, JPG, JPEG, PNG, WebP, DOCX, and XLSX files.',
  },
  {
    q: 'Can I convert PDF pages into separate images?',
    a: 'Yes. Single-page PDFs download as one JPG, while multi-page PDFs are bundled into a ZIP automatically.',
  },
  {
    q: 'Can I convert Word to Excel and Excel to Word here?',
    a: 'Yes. DOCX files can be converted to XLSX, and XLSX files can be converted to DOCX directly from this page.',
  },
  {
    q: 'Will transparent PNG or WebP files convert correctly to JPG?',
    a: 'Yes. When converting to JPG, PixelPress adds a white background so transparent regions render cleanly.',
  },
  {
    q: 'Do I need to install any software or sign up?',
    a: 'No. The converter runs in your browser and does not require registration, software installation, or paid credits.',
  },
];

export default function PixelPressConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<string>('jpg');
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isZipDownloaded, setIsZipDownloaded] = useState(false);
  const [progressTxt, setProgressTxt] = useState('Processing...');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  
  const resetState = useCallback(() => {
      setFile(null); 
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null); 
      setIsZipDownloaded(false); 
      setProgressTxt('Processing...');
  }, [downloadUrl]);

  const isDocxFile = (f: File) =>
    f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    f.name.toLowerCase().endsWith('.docx');

  const isXlsxFile = (f: File) =>
    f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    f.name.toLowerCase().endsWith('.xlsx');

  const processFile = (selectedFile: File) => {
    const docx = isDocxFile(selectedFile);
    const xlsx = isXlsxFile(selectedFile);
    const validImagePdfTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (!validImagePdfTypes.includes(selectedFile.type) && !docx && !xlsx) {
      toast({
        variant: "destructive",
        title: "Unsupported file type",
        description: "Please upload PDF, JPG, PNG, WebP, DOCX, or XLSX files."
      });
      return;
    }

    resetState();
    setFile(selectedFile);

    if (docx) {
      setTargetFormat('xlsx');
    } else if (xlsx) {
      setTargetFormat('docx');
    } else if (selectedFile.type === 'application/pdf') {
      setTargetFormat('jpg');
    } else if (selectedFile.type.startsWith('image/')) {
      setTargetFormat(selectedFile.type === 'image/jpeg' ? 'pdf' : 'jpeg');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const convertImageToImage = async (format: string) => {
    if (!file) return;
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas error');

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(imageBitmap, 0, 0);

    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
             setDownloadUrl(URL.createObjectURL(blob));
             resolve();
        } else reject(new Error('Image conversion failed'));
      }, `image/${format}`, 0.92);
    });
  };

  const convertImageToPdf = async () => {
      if (!file) return;
      setProgressTxt('Generating PDF...');
      
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise(r => img.onload = r);

      const doc = new jsPDF({
        orientation: img.width > img.height ? 'l' : 'p',
        unit: 'px',
        format: [img.width, img.height]
      });
      
      doc.addImage(img, file.type.split('/')[1].toUpperCase(), 0, 0, img.width, img.height);
      const pdfBlob = doc.output('blob');
      setDownloadUrl(URL.createObjectURL(pdfBlob));
      URL.revokeObjectURL(url);
  };

  const renderPageToBlob = async (pdf: any, pageNum: number, totalPages: number): Promise<Blob | null> => {
      setProgressTxt(`Rendering page ${pageNum}/${totalPages}...`);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) throw new Error('Canvas context missing');
      await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
      return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  };

  const convertPdfToImages = async () => {
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    if (totalPages === 1) {
        const blob = await renderPageToBlob(pdf, 1, 1);
        if (blob) {
            setDownloadUrl(URL.createObjectURL(blob));
        } else {
            throw new Error("Failed to render page.");
        }
    } else {
        const zip = new JSZip();
        for (let i = 1; i <= totalPages; i++) {
            const blob = await renderPageToBlob(pdf, i, totalPages);
            if (blob) {
                const fileName = `page-${String(i).padStart(2, '0')}.jpg`;
                zip.file(fileName, blob);
            }
        }
        setProgressTxt('Compressing Zip...');
        const zipContent = await zip.generateAsync({type:"blob"});
        saveAs(zipContent, `${file.name.split('.')[0]}-images.zip`);
        setIsZipDownloaded(true);
    }
  };

  const convertWordToExcel = async () => {
    if (!file) return;
    setProgressTxt('Reading Word document...');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');

    const wb = XLSX.utils.book_new();
    const tables = Array.from(htmlDoc.querySelectorAll('table'));

    tables.forEach((table, idx) => {
      const rows: string[][] = [];
      table.querySelectorAll('tr').forEach(tr => {
        const cells: string[] = [];
        tr.querySelectorAll('td, th').forEach(td => {
          cells.push(td.textContent?.trim() ?? '');
        });
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, `Table ${idx + 1}`);
      }
    });

    const paragraphs: string[][] = [];
    htmlDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach(el => {
      const text = el.textContent?.trim();
      if (text) paragraphs.push([text]);
    });

    if (paragraphs.length > 0) {
      const ws = XLSX.utils.aoa_to_sheet(paragraphs);
      XLSX.utils.book_append_sheet(wb, ws, tables.length > 0 ? 'Text Content' : 'Content');
    }

    if (wb.SheetNames.length === 0) {
      throw new Error('No content could be extracted from the Word document.');
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    setDownloadUrl(URL.createObjectURL(blob));
  };

  const convertExcelToWord = async () => {
    if (!file) return;
    setProgressTxt('Reading Excel file...');

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    setProgressTxt('Generating Word document...');

    const children: (Paragraph | Table)[] = [];

    wb.SheetNames.forEach((sheetName, sheetIdx) => {
      if (sheetIdx > 0) children.push(new Paragraph({ text: '' }));

      children.push(
        new Paragraph({ text: sheetName, heading: HeadingLevel.HEADING_1 })
      );

      const ws = wb.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      if (!data.length) {
        children.push(new Paragraph({ text: '(Empty sheet)' }));
        return;
      }

      const maxCols = Math.max(...data.map(r => r.length), 1);
      const normalizedData = data.map(row => {
        const r = [...row];
        while (r.length < maxCols) r.push('');
        return r;
      });

      const colWidth = Math.max(Math.floor(9000 / maxCols), 500);

      const tableRows = normalizedData.map(
        row =>
          new TableRow({
            children: row.map(
              cell =>
                new TableCell({
                  children: [new Paragraph({ text: String(cell ?? '') })],
                  width: { size: colWidth, type: WidthType.DXA },
                })
            ),
          })
      );

      children.push(
        new Table({ rows: tableRows, width: { size: 9000, type: WidthType.DXA } })
      );
      children.push(new Paragraph({ text: '' }));
    });

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    setDownloadUrl(URL.createObjectURL(blob));
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setProgressTxt('Initializing...');

    try {
      if (isDocxFile(file) && targetFormat === 'xlsx') {
        await convertWordToExcel();
      } else if (isXlsxFile(file) && targetFormat === 'docx') {
        await convertExcelToWord();
      } else if (file.type === 'application/pdf') {
        if (targetFormat === 'jpg') await convertPdfToImages();
      } else if (file.type.startsWith('image/')) {
        if (targetFormat === 'pdf') await convertImageToPdf();
        else if (['jpeg', 'png', 'webp'].includes(targetFormat)) await convertImageToImage(targetFormat);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Conversion failed",
        description: err.message || "Something went wrong during conversion."
      });
    } finally {
      setIsConverting(false);
    }
  };

  const getAvailableFormats = () => {
    if (!file) return [];
    if (isDocxFile(file)) return [{ val: 'xlsx', label: 'Excel Spreadsheet (.xlsx)' }];
    if (isXlsxFile(file)) return [{ val: 'docx', label: 'Word Document (.docx)' }];
    if (file.type === 'application/pdf') {
        return [{ val: 'jpg', label: 'JPG Image(s)' }];
    }
    if (file.type.startsWith('image/')) {
        return [
            { val: 'pdf', label: 'PDF Document' },
            { val: 'jpeg', label: 'JPG Image' },
            { val: 'png', label: 'PNG Image' },
            { val: 'webp', label: 'WEBP Image' }
        ].filter(fmt => !file.type.includes(fmt.val));
    }
    return [];
  };

  const isDone = downloadUrl || isZipDownloaded;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>Format Converter | Convert PDF, Images, Word & Excel Free | PixelPress</title>
        <meta
          name="description"
          content="Convert PDF, JPG, PNG, WebP, DOCX, and XLSX files online for free with PixelPress. Private browser-based processing keeps every file on your device."
        />
        <meta
          name="keywords"
          content="format converter, PDF to JPG, JPG to PDF, image converter, Word to Excel, Excel to Word, secure online converter, free file converter"
        />
      </Helmet>
      <Header />

      <main className="pt-24 pb-20 px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Free Format Converter - Convert PDF, Images, Word, and Excel Online
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Switch between popular file formats in seconds. Convert PDFs to images, images to PDF, and Word to Excel or Excel to Word with private browser-based processing.
            </p>
          </motion.div>

          <div 
            className={`
              relative w-full max-w-2xl mx-auto
              border-2 border-dashed rounded-3xl p-10 md:p-16
              transition-all duration-300 ease-out
              bg-white/50 hover:bg-white/80 backdrop-blur-sm
              text-center group cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl' : 'border-border shadow-lg'}
              ${file ? 'border-solid border-primary/20 ring-4 ring-primary/5' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx"
            />
            
            {!file ? (
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-white shadow-md border border-border/50 transition-transform group-hover:scale-110">
                  <CloudUpload className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">Upload your file</h2>
                  <p className="text-muted-foreground text-base">
                    Drag and drop or click to browse<br/>
                    <span className="text-xs uppercase tracking-wider font-medium opacity-60 mt-2 block">
                      PDF • JPG • PNG • WEBP • DOCX • XLSX
                    </span>
                  </p>
                </div>
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20">
                  Select File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/60 rounded-2xl p-6 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm border border-border/40">
                      {file.type === 'application/pdf' ? <FileText size={28}/> : (isDocxFile(file) || isXlsxFile(file)) ? <FileSpreadsheet size={28}/> : <Images size={28}/>}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!isConverting && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); resetState(); }} className="rounded-full">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                {!isDone ? (
                  <div className="flex flex-col gap-6 w-full items-center">
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-border/60 rounded-xl px-5 py-3 shadow-sm min-w-[200px]">
                        <span className="text-sm text-muted-foreground font-medium">Convert to:</span>
                        <select 
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value)}
                          disabled={isConverting}
                          className="bg-transparent font-bold text-foreground outline-none cursor-pointer flex-1"
                        >
                          {getAvailableFormats().map(fmt => (
                            <option key={fmt.val} value={fmt.val}>{fmt.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <Button 
                        onClick={(e) => { e.stopPropagation(); handleConvert(); }}
                        disabled={isConverting}
                        size="lg"
                        className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 min-w-[180px]"
                      >
                        {isConverting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Converting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-current" />
                            <span>Convert Now</span>
                          </div>
                        )}
                      </Button>
                    </div>
                    
                    {isConverting && (
                      <p className="text-sm font-medium text-primary animate-pulse italic">
                        {progressTxt}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 w-full animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                        <Download className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Conversion Ready!</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      {downloadUrl && (
                        <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 w-full sm:w-auto">
                          <a href={downloadUrl} download={`${file.name.split('.')[0]}-converted.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`}>
                            Download File
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="lg" onClick={(e) => { e.stopPropagation(); resetState(); }} className="rounded-full px-10 h-14 text-lg font-bold w-full sm:w-auto">
                        Convert Another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-2xl border border-border/40 backdrop-blur-sm text-left">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-lg text-foreground mb-1">{item.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              );
            })}
          </div>

          <section className="pt-6 text-left max-w-4xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
              How to Use the Format Converter
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="group p-6 rounded-2xl bg-white border border-border/60 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="pt-6 text-left max-w-3xl mx-auto w-full" aria-label="Frequently asked questions">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">FAQs</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`general-converter-faq-${idx + 1}`}
                  className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="font-medium hover:no-underline text-left">
                    {idx + 1}. {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="pt-4 text-center">
            <p className="text-muted-foreground">
              Explore focused tools:{' '}
              <Link href="/excel-to-word" className="text-primary hover:underline font-medium">Excel to Word</Link>
              {' '},{' '}
              <Link href="/word-to-excel" className="text-primary hover:underline font-medium">Word to Excel</Link>
              {' '}and{' '}
              <Link href="/all-converters" className="text-primary hover:underline font-medium">All Converters</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
