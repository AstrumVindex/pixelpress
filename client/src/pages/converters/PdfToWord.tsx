import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { CloudUpload, Zap, FileText, X, Download, Lock, Table2, Gauge, Cpu } from 'lucide-react';
import { pdfjsLib } from '@/lib/pdfWorker';
import { Document, Packer, Paragraph, TextRun, AlignmentType, ShadingType } from 'docx';
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
    desc: 'Your PDF is processed entirely in your browser. No file ever leaves your device.',
  },
  {
    icon: Table2,
    title: 'Page-by-Page Headings',
    desc: 'Each PDF page gets a clear heading in the resulting Word document for easy navigation.',
  },
  {
    icon: Gauge,
    title: 'Instant Browser Processing',
    desc: 'No upload queues or wait times. Your DOCX file is ready right after conversion completes.',
  },
  {
    icon: FileText,
    title: 'Text Extraction',
    desc: 'PixelPress reads all selectable text from your PDF and places it into editable Word paragraphs.',
  },
];

const steps = [
  { icon: CloudUpload, title: '1. Upload', desc: 'Select your PDF file using the button above.' },
  { icon: Cpu, title: '2. Extract', desc: 'PixelPress reads the text from every page of your PDF.' },
  { icon: Download, title: '3. Download', desc: 'Save your ready-to-edit Word document instantly.' },
];

const faqs = [
  {
    q: 'Is PDF to Word conversion safe on PixelPress?',
    a: 'Yes. All processing runs locally in your browser. Your PDF never leaves your device.',
  },
  {
    q: 'How does the PDF to Word converter work?',
    a: 'PixelPress uses pdf.js to extract text from each page, then builds a DOCX file using the docx library — each page gets its own heading.',
  },
  {
    q: 'Does it support scanned or image-based PDFs?',
    a: 'No. This tool extracts selectable text only. Scanned PDFs require OCR software.',
  },
  {
    q: 'Can I convert a multi-page PDF to Word?',
    a: 'Yes. Every page is extracted and added as a clearly labelled section in the resulting DOCX file.',
  },
  {
    q: 'Do I need to create an account or pay?',
    a: 'No. PDF to Word conversion on PixelPress is completely free with no sign-up required.',
  },
];

export default function PdfToWord() {
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

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast({ variant: 'destructive', title: 'Unsupported file', description: 'Please upload a PDF file.' });
      return;
    }
    resetState();
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setProgressTxt('Initializing...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const allChildren: Paragraph[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgressTxt(`Extracting page ${i}/${totalPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport.width;
        const textContent = await page.getTextContent();
        const pdfStyles: Record<string, any> = (textContent as any).styles || {};

        // Group text items into lines by Y coordinate (tolerance ±3pt)
        const lineMap = new Map<number, any[]>();
        for (const rawItem of textContent.items) {
          const item = rawItem as any;
          if (typeof item.str !== 'string') continue;
          const y: number = item.transform[5];
          let placed = false;
          const lineMapEntries = Array.from(lineMap.entries());
          for (let li = 0; li < lineMapEntries.length; li++) {
            const [ky] = lineMapEntries[li];
            if (Math.abs(ky - y) <= 3) {
              lineMap.get(ky)!.push(item);
              placed = true;
              break;
            }
          }
          if (!placed) lineMap.set(y, [item]);
        }

        // Sort lines top-to-bottom (PDF Y increases upward → sort descending)
        const sortedLines = Array.from(lineMap.entries()).sort(([a], [b]) => b - a);

        // Determine left margin from all x positions
        const allX = sortedLines
          .flatMap(([, items]) => items.map((it: any) => it.transform[4] as number))
          .filter(x => x > 0);
        const leftMargin = allX.length ? Math.min(...allX) : 50;

        // Compute median body font size so we can tell names (large) from section headers (body-size)
        const allFontSizes = sortedLines
          .flatMap(([, items]) =>
            items.map((it: any) => Math.abs(it.transform[0]) || Math.abs(it.transform[3]))
          )
          .filter((fs: number) => fs > 3);
        allFontSizes.sort((a: number, b: number) => a - b);
        const medianFs: number =
          allFontSizes.length ? allFontSizes[Math.floor(allFontSizes.length / 2)] : 11;

        if (i > 1) allChildren.push(new Paragraph({ text: '' }));

        const getIsBold = (item: any): boolean => {
          const fn = (item.fontName || '') as string;
          const ff = ((pdfStyles[fn]?.fontFamily || '') as string).toLowerCase();
          return ff.includes('bold') || fn.toLowerCase().includes('bold');
        };

        for (const [, lineItems] of sortedLines) {
          lineItems.sort((a: any, b: any) => a.transform[4] - b.transform[4]);
          const lineText = lineItems.map((it: any) => it.str as string).join('').trim();
          if (!lineText) continue;

          const firstItem = lineItems[0] as any;
          const xPos: number = firstItem.transform[4];

          // Average font size of this line
          const lineFontSizes = lineItems.map(
            (it: any) => Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || medianFs
          );
          const avgLineFs: number =
            lineFontSizes.reduce((s: number, v: number) => s + v, 0) / lineFontSizes.length;

          const isCentered = xPos > leftMargin + pageWidth * 0.15;
          const isAllCaps =
            lineText === lineText.toUpperCase() && lineText.replace(/\W/g, '').length > 2;

          // A line is a section header only when it is ALL_CAPS, not centered,
          // AND its font size is NOT significantly larger than the body median.
          // Names/titles are ALL_CAPS but printed in a noticeably larger font.
          const isLargeText = avgLineFs > medianFs * 1.25;
          const isSectionHeader = isAllCaps && !isCentered && !isLargeText;

          // Detect bullet lines — strip the bullet char and use Word bullet style
          const bulletChars = ['•', '·', '▪', '-', '*'];
          const startsWithBullet = bulletChars.some(b => lineText.startsWith(b));
          const displayItems = startsWithBullet
            ? lineItems.map((it: any) => ({ ...it, str: (it.str as string).replace(/^[•·▪\-\*]\s*/, '') }))
            : lineItems;

          const runs = displayItems
            .filter((item: any) => typeof item.str === 'string' && (item.str as string).length > 0)
            .map((item: any) => {
              const fs = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || 12;
              const bold = getIsBold(item) || isSectionHeader || isLargeText;
              return new TextRun({
                text: item.str,
                bold,
                size: Math.max(16, Math.round(fs * 1.8)),
              });
            });

          if (runs.length === 0) continue;

          const indentLeft =
            !isCentered && !isSectionHeader && !startsWithBullet && xPos > leftMargin + 20
              ? Math.round((xPos - leftMargin) * 14)
              : undefined;

          allChildren.push(
            new Paragraph({
              children: runs,
              alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
              shading: isSectionHeader
                ? { type: ShadingType.CLEAR, fill: 'E8E8E8', color: 'auto' }
                : undefined,
              spacing: {
                before: isSectionHeader ? 140 : 40,
                after: isSectionHeader ? 80 : 40,
              },
              indent:
                startsWithBullet
                  ? { left: 360, hanging: 360 }
                  : indentLeft !== undefined
                  ? { left: indentLeft }
                  : undefined,
              bullet: startsWithBullet ? { level: 0 } : undefined,
            })
          );
        }
      }

      setProgressTxt('Building Word document...');
      const doc = new Document({ sections: [{ children: allChildren }] });
      const blob = await Packer.toBlob(doc);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Conversion failed', description: err.message || 'Something went wrong.' });
    } finally {
      setIsConverting(false);
    }
  };

  const baseName = file?.name.replace(/\.pdf$/i, '') ?? 'converted';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>PDF to Word Converter – Free Online | PixelPress</title>
        <meta name="description" content="Convert PDF to Word (.docx) free online with PixelPress. Extract text from every page into an editable Word document using 100% private browser-based processing." />
        <meta name="keywords" content="PDF to Word, convert PDF to DOCX, PDF to document, free PDF converter, online PDF to Word" />
      </Helmet>

      <main className="pt-24 pb-20 px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              PDF to Word Converter – Free & Private
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Extract text from any PDF and download a ready-to-edit Word document. Each page becomes its own labelled section — no upload required.
            </p>
          </motion.div>

          <div
            className={`relative w-full max-w-2xl mx-auto border-2 border-dashed rounded-3xl p-10 md:p-16 transition-all duration-300 bg-white/50 hover:bg-white/80 backdrop-blur-sm text-center group cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl' : 'border-border shadow-lg'}
              ${file ? 'border-solid border-primary/20 ring-4 ring-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,application/pdf" />

            {!file ? (
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-white shadow-md border border-border/50 transition-transform group-hover:scale-110">
                  <CloudUpload className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">Upload your PDF</h2>
                  <p className="text-muted-foreground text-base">
                    Drag and drop or click to browse<br />
                    <span className="text-xs uppercase tracking-wider font-medium opacity-60 mt-2 block">PDF only</span>
                  </p>
                </div>
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20">
                  Select PDF
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 border border-border/60 rounded-2xl p-6 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm border border-border/40">
                      <FileText size={28} />
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

                {!downloadUrl ? (
                  <div className="flex flex-col gap-6 w-full items-center">
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleConvert(); }}
                      disabled={isConverting}
                      size="lg"
                      className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 min-w-[200px]"
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
                    {isConverting && (
                      <p className="text-sm font-medium text-primary animate-pulse italic">{progressTxt}</p>
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
                      <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 w-full sm:w-auto">
                        <a href={downloadUrl} download={`${baseName}.docx`}>
                          <FileText className="w-5 h-5 mr-2" /> Download Word
                        </a>
                      </Button>
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
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">How to Convert PDF to Word</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="group p-6 rounded-2xl bg-white border border-border/60 hover:border-primary/25 hover:shadow-lg transition-all">
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
                  value={`pdf-to-word-faq-${idx + 1}`}
                  className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="font-medium hover:no-underline text-left">
                    {idx + 1}. {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="pt-4 text-center">
            <p className="text-muted-foreground">
              Related tools:{' '}
              <Link href="/pdf-to-excel" className="text-primary hover:underline font-medium">PDF to Excel</Link>
              {', '}
              <Link href="/pdf-to-jpg" className="text-primary hover:underline font-medium">PDF to JPG</Link>
              {', '}
              <Link href="/excel-to-word" className="text-primary hover:underline font-medium">Excel to Word</Link>
              {' and '}
              <Link href="/all-converters" className="text-primary hover:underline font-medium">All Converters</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
