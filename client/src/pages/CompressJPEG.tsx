import { Helmet } from "react-helmet";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { Controls } from "@/components/Controls";
import { RelatedTools } from "@/components/RelatedTools";
import { useImageCompressor } from "@/hooks/use-image-compressor";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Cpu, Sliders, Monitor, Download, Trash2, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CompressJPEG() {
  const {
    files,
    isCompressing,
    settings,
    setSettings,
    handleFiles,
    removeFile,
    reset
  } = useImageCompressor();

  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const fileItem of files) {
        if (fileItem.status === 'done' && fileItem.compressed) {
          zip.file(fileItem.name.replace(/\.[^/.]+$/, "") + "-compressed.jpg", fileItem.compressed);
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "pixelpress-compressed-jpg.zip");
    } catch (err) {
      console.error("ZIP creation failed", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>Compress JPEG Images Online – Free & Secure | PixelPress</title>
        <meta name="description" content="Compress JPEG images online without losing quality. Fast, secure, browser-based JPEG compressor. No server uploads, 100% private." />
      </Helmet>
      <Header />
      
      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Compress JPEG Images <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                  Without Losing Quality
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reduce JPEG file size dramatically while maintaining visual quality. Perfect for photos and realistic images.
              </p>
            </motion.div>
            
            <div className="mt-8">
              <UploadZone 
                onFileSelect={handleFiles} 
                accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
                allowedFormats="JPEG"
                errorMessage="Please upload JPEG images"
              />
            </div>
          </section>

          {files.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 sticky top-24">
                  <Controls settings={settings} onChange={setSettings} />
                  <div className="mt-6 pt-6 border-t space-y-3">
                    {files.some(f => f.status === 'done') && (
                      <Button 
                        onClick={handleDownloadZip} 
                        disabled={isZipping}
                        className="w-full rounded-xl h-12 font-bold bg-primary"
                      >
                        {isZipping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                        Download All as ZIP
                      </Button>
                    )}
                    <Button variant="outline" onClick={reset} className="w-full rounded-xl h-12">
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <AnimatePresence>
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        file.status === 'done' ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-900 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {file.previewUrl ? (
                            <img src={file.previewUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Zap className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(file.originalSize / 1024).toFixed(1)} KB</span>
                            {file.status === 'done' && (
                              <>
                                <span className="text-green-600 font-bold">→ {(file.compressedSize / 1024).toFixed(1)} KB</span>
                                <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-bold">-{file.saved}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'compressing' && (
                          <div className="flex items-center gap-2 text-primary font-bold text-sm px-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Optimizing...</span>
                          </div>
                        )}
                        {file.status === 'done' && file.previewUrl && (
                          <Button size="sm" variant="ghost" className="rounded-full text-green-600" asChild>
                            <a href={file.previewUrl} download={`${file.name.split('.')[0]}-compressed.jpg`}>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)} className="rounded-full text-slate-400 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <section className="bg-slate-50 dark:bg-slate-900/50 -mx-4 md:-mx-6 py-16 md:py-20">
            <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-12">
              <div className="space-y-6 text-center sm:text-left">
                <h2 className="text-3xl font-display font-bold text-foreground">Why Compress JPEG Images?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  JPEG is the most common format for photographs online. PixelPress compresses JPEG files intelligently, reducing file size by 50-80% while maintaining photo quality that's imperceptible to the human eye.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Zap, title: "Faster Speed", desc: "Instantly reduce photo file sizes for web." },
                  { icon: Cpu, title: "Quality Preservation", desc: "Maintain professional photo standards." },
                  { icon: Sliders, title: "Social Ready", desc: "Perfect for Instagram, Facebook and more." },
                  { icon: Monitor, title: "SEO Optimized", desc: "Faster images mean better Google rankings." }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl border border-border/50 shadow-sm">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="max-w-3xl mx-auto pt-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">FAQs</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">1. What happens when I compress a JPEG image?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  JPEG compression reduces file size by optimizing image data while keeping the image visually acceptable.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">2. Is JPEG compression lossy?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. JPEG compression is lossy, but PixelPress balances compression and quality to minimize visible loss.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">3. Will my JPEG look blurry after compression?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  In most cases, no. PixelPress maintains good visual quality even at smaller file sizes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">4. Are original JPEG images stored anywhere?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. All JPEG processing is done locally in your browser for maximum privacy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
      <RelatedTools currentTool="compress-jpeg" />
      <Footer />
    </div>
  );
}
