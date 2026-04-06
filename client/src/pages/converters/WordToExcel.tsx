import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { CloudUpload, Zap, FileSpreadsheet, X, Download, Lock, Table2, Gauge, FileText, Cpu } from 'lucide-react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
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
    title: 'Privacy-First Conversion',
    desc: 'Your Word documents are processed client-side, so private data never touches PixelPress servers.',
  },
  {
    icon: Table2,
    title: 'Table-to-Sheet Detection',
    desc: 'Tables inside your DOCX file are detected automatically and placed into individual Excel sheets.',
  },
  {
    icon: Gauge,
    title: 'Instant Browser Processing',
    desc: 'No upload queues or wait times. Your XLSX file is ready right after conversion completes.',
  },
  {
    icon: FileText,
    title: 'Clean Data Extraction',
    desc: 'Text paragraphs are converted into clean spreadsheet rows for reporting, analysis, and budgeting.',
  },
];

const steps = [
  {
    icon: CloudUpload,
    title: '1. Select',
    desc: 'Upload your .docx file using the button above.',
  },
  {
    icon: Cpu,
    title: '2. Extract',
    desc: 'PixelPress scans the document for tables and text structures.',
  },
  {
    icon: Download,
    title: '3. Download',
    desc: 'Save your new .xlsx file directly to your device.',
  },
];

const faqs = [
  {
    q: 'Is my Word document safe on PixelPress?',
    a: 'Yes. Conversion is performed entirely within your browser, so your document is never uploaded to the cloud.',
  },
  {
    q: 'What happens to the tables in my Word file?',
    a: 'Each table is extracted and converted into a corresponding sheet or a structured data block in Excel.',
  },
  {
    q: 'Does it convert plain text into rows?',
    a: 'Yes. Standard text paragraphs are converted into individual rows, making non-tabular data easier to organize.',
  },
  {
    q: 'Can I convert large Word files?',
    a: 'Conversion speed depends on your device, but most standard documents finish in under a second.',
  },
  {
    q: 'Is there a daily limit for conversions?',
    a: 'No. PixelPress offers unlimited free conversions for all users.',
  },
  {
    q: 'Will it work on my phone?',
    a: 'Yes. PixelPress is responsive and works on mobile browsers as well as desktop.',
  },
  {
    q: 'Do I need a Microsoft account?',
    a: 'No account or subscription is required to use the converter.',
  },
  {
    q: 'What if my Word file has images?',
    a: 'This tool focuses on extracting text and tables. Images may be ignored so the spreadsheet stays clean and usable.',
  },
];

export default function WordToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progressTxt, setProgressTxt] = useState('Processing...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setFile(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setProgressTxt('Processing...');
  }, [downloadUrl]);

  const processFile = (f: File) => {
    const valid =
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      f.name.toLowerCase().endsWith('.docx');
    if (!valid) {
      toast({ variant: 'destructive', title: 'Unsupported file', description: 'Please upload a .docx Word file.' });
      return;
    }
    resetState();
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setProgressTxt('Reading Word document...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(result.value, 'text/html');

      const wb = XLSX.utils.book_new();
      const tables = Array.from(htmlDoc.querySelectorAll('table'));

      tables.forEach((table, idx) => {
        const rows: string[][] = [];
        table.querySelectorAll('tr').forEach(tr => {
          const cells: string[] = [];
          tr.querySelectorAll('td, th').forEach(td => cells.push(td.textContent?.trim() ?? ''));
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
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.aoa_to_sheet(paragraphs),
          tables.length > 0 ? 'Text Content' : 'Content'
        );
      }

      if (wb.SheetNames.length === 0) throw new Error('No content found in the Word document.');

      setProgressTxt('Generating Excel file...');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Conversion failed', description: err.message || 'Something went wrong.' });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>Word to Excel Converter | Convert DOCX to XLSX Free & Secure | PixelPress</title>
        <meta
          name="description"
          content="Easily convert Word to Excel for free. PixelPress extracts tables and text into structured XLSX sheets entirely in your browser for 100% privacy."
        />
        <meta
          name="keywords"
          content="Word to Excel, DOCX to XLSX, extract table from Word to Excel, convert Word to spreadsheet, free online file converter"
        />
      </Helmet>

      <main className="pt-24 pb-20 px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Free Word to Excel Converter - Convert DOCX to XLSX Online
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Turn your Word documents into organized Excel spreadsheets instantly. Our intelligent tool detects tables to create sheets and converts text paragraphs into structured rows.
            </p>
          </motion.div>

          <div
            className={`relative w-full max-w-2xl mx-auto border-2 border-dashed rounded-3xl p-10 md:p-16 transition-all duration-300 ease-out bg-white/50 hover:bg-white/80 backdrop-blur-sm text-center group cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl' : 'border-border shadow-lg'}
              ${file ? 'border-solid border-primary/20 ring-4 ring-primary/5' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" accept=".docx" />

            {!file ? (
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-white shadow-md border border-border/50 transition-transform group-hover:scale-110">
                  <CloudUpload className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">Upload your Word file</h2>
                  <p className="text-muted-foreground text-base">
                    Drag and drop or click to browse<br />
                    <span className="text-xs uppercase tracking-wider font-medium opacity-60 mt-2 block">DOCX only</span>
                  </p>
                </div>
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20">Select File</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/60 rounded-2xl p-6 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm border border-border/40">
                      <FileSpreadsheet size={28} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!isConverting && (
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); resetState(); }} className="rounded-full">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                {!downloadUrl ? (
                  <div className="flex flex-col gap-6 w-full items-center">
                    <Button
                      onClick={e => { e.stopPropagation(); handleConvert(); }}
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
                          <span>Convert to Excel</span>
                        </div>
                      )}
                    </Button>
                    {isConverting && <p className="text-sm font-medium text-primary animate-pulse italic">{progressTxt}</p>}
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
                      <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 w-full sm:w-auto">
                        <a href={downloadUrl} download={`${file.name.replace(/\.docx$/i, '')}.xlsx`}>Download XLSX File</a>
                      </Button>
                      <Button variant="outline" size="lg" onClick={e => { e.stopPropagation(); resetState(); }} className="rounded-full px-10 h-14 text-lg font-bold w-full sm:w-auto">
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

          <section className="pt-6 text-left max-w-3xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
              How to Convert Word to Excel
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
                  value={`word-excel-faq-${idx + 1}`}
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
              Explore more tools:{' '}
              <Link href="/" className="text-primary hover:underline font-medium">Image Compressor</Link>
              {' '}and{' '}
              <Link href="/converter" className="text-primary hover:underline font-medium">Format Converter</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
