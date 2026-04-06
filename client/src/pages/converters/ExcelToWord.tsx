import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { CloudUpload, Zap, FileSpreadsheet, X, Download, Lock, Table2, Gauge, BadgeDollarSign, Cpu } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
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
    title: '100% Private & Secure',
    desc: 'PixelPress processes files locally in your browser. Your data never leaves your computer.',
  },
  {
    icon: Table2,
    title: 'Smart Table Formatting',
    desc: 'Each Excel sheet is converted into a clean Word table with rows and columns preserved.',
  },
  {
    icon: Gauge,
    title: 'Blazing Fast Speed',
    desc: 'No upload queues or server delays. Conversion happens instantly on your device.',
  },
  {
    icon: BadgeDollarSign,
    title: 'No Limits, No Fees',
    desc: 'Convert as many files as you need with no watermark and no premium lock.',
  },
];

const faqs = [
  {
    q: 'Is it safe to convert my Excel files to Word on PixelPress?',
    a: 'Yes. Conversion happens entirely in your browser using client-side processing, so your files are never uploaded to a server.',
  },
  {
    q: 'Will I lose formatting during XLSX to DOCX conversion?',
    a: 'The tool preserves structure by converting each sheet into an editable Word table so rows and columns stay organized.',
  },
  {
    q: 'Can I convert multiple Excel sheets at once?',
    a: 'Yes. Every sheet in your workbook is included in the output document as a separate table section.',
  },
  {
    q: 'Do I need to install any software or extension?',
    a: 'No installation is required. PixelPress runs directly in modern browsers including Chrome, Safari, Firefox, and Edge.',
  },
  {
    q: 'Is there a file size limit for the converter?',
    a: 'There is no server-side cap. Practical limits depend on your device memory, but standard spreadsheets convert quickly.',
  },
  {
    q: 'Why use PixelPress instead of other online converters?',
    a: 'Most converters upload files to remote servers. PixelPress keeps processing local for better privacy and faster results.',
  },
  {
    q: 'Can I edit the Word file after conversion?',
    a: 'Yes. The output is a standard DOCX file that you can edit in Microsoft Word, Google Docs, or LibreOffice.',
  },
  {
    q: 'Does PixelPress support older .xls files?',
    a: 'The converter is optimized for modern .xlsx workbooks. For .xls files, open in Excel and save as .xlsx first.',
  },
];

const steps = [
  {
    icon: CloudUpload,
    title: '1. Select',
    desc: 'Drag and drop your .xlsx file into the upload box above.',
  },
  {
    icon: Cpu,
    title: '2. Process',
    desc: 'PixelPress automatically reads your spreadsheets and prepares the DOCX structure.',
  },
  {
    icon: Download,
    title: '3. Download',
    desc: 'Click "Download Word File" to save your formatted document instantly.',
  },
];

export default function ExcelToWord() {
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
      f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      f.name.toLowerCase().endsWith('.xlsx');
    if (!valid) {
      toast({ variant: 'destructive', title: 'Unsupported file', description: 'Please upload a .xlsx Excel file.' });
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
    setProgressTxt('Reading Excel file...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

      setProgressTxt('Generating Word document...');
      const children: (Paragraph | Table)[] = [];

      wb.SheetNames.forEach((sheetName, sheetIdx) => {
        if (sheetIdx > 0) children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: sheetName, heading: HeadingLevel.HEADING_1 }));

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

        children.push(new Table({ rows: tableRows, width: { size: 9000, type: WidthType.DXA } }));
        children.push(new Paragraph({ text: '' }));
      });

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
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
        <title>Excel to Word Converter | Convert XLSX to DOCX Free & Secure | PixelPress</title>
        <meta
          name="description"
          content="Convert Excel to Word online for free with PixelPress. Safe, client-side conversion ensures your files never leave your device. Transform XLSX spreadsheets into editable Word tables instantly."
        />
        <meta
          name="keywords"
          content="Excel to Word, XLSX to DOCX, convert Excel table to Word, online spreadsheet converter, secure file conversion, free Excel converter"
        />
      </Helmet>

      <main className="pt-24 pb-20 px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Free Excel to Word Converter - Convert XLSX to DOCX Online
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Effortlessly transform your Excel spreadsheets into professionally formatted Word documents. Each sheet is converted into a clean, editable table in seconds.
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
            <input type="file" ref={fileInputRef} onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" accept=".xlsx" />

            {!file ? (
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-white shadow-md border border-border/50 transition-transform group-hover:scale-110">
                  <CloudUpload className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">Upload your Excel file</h2>
                  <p className="text-muted-foreground text-base">
                    Drag and drop or click to browse<br />
                    <span className="text-xs uppercase tracking-wider font-medium opacity-60 mt-2 block">XLSX only</span>
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
                          <span>Convert to Word</span>
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
                        <a href={downloadUrl} download={`${file.name.replace(/\.xlsx$/i, '')}.docx`}>Download Word File</a>
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
              How to Convert Excel to Word in 3 Steps
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
                  value={`excel-word-faq-${idx + 1}`}
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
