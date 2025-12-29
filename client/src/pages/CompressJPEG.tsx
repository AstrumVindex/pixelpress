import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { Controls } from "@/components/Controls";
import { ComparisonView } from "@/components/ComparisonView";
import { useImageCompressor } from "@/hooks/use-image-compressor";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CompressJPEG() {
  useEffect(() => {
    document.title = "Compress JPEG Images Online – Free & Secure | PixelPress";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Compress JPEG images online without losing quality. Fast, secure, browser-based JPEG compressor. No server uploads, 100% private.");
    }
  }, []);

  const {
    originalFile,
    compressedFile,
    isCompressing,
    settings,
    setSettings,
    previewUrl,
    originalPreviewUrl,
    handleFileSelect,
    reset
  } = useImageCompressor();

  const handleDownload = () => {
    if (compressedFile) {
      const url = URL.createObjectURL(compressedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFile?.name?.split('.')[0] || 'image'}-compressed.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-8 max-w-3xl mx-auto">
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
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Reduce JPEG file size dramatically while maintaining visual quality. Perfect for photos and realistic images.
              </p>
            </motion.div>
            
            {!originalFile && (
              <div className="mt-12">
                <UploadZone onFileSelect={handleFileSelect} />
              </div>
            )}
          </section>

          {/* Tool Section */}
          <AnimatePresence>
            {originalFile && previewUrl && originalPreviewUrl && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-6xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 order-2 lg:order-1">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/5 rounded-3xl p-6 sticky top-24">
                      <Controls settings={settings} onChange={setSettings} />
                    </div>
                  </div>

                  <div className="lg:col-span-8 order-1 lg:order-2">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/5 rounded-3xl p-6">
                      <ComparisonView 
                        originalUrl={originalPreviewUrl}
                        compressedUrl={previewUrl}
                        originalSize={originalFile.size}
                        compressedSize={compressedFile?.size || originalFile.size}
                        isCompressing={isCompressing}
                        onDownload={handleDownload}
                        onReset={reset}
                      />
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* SEO Content */}
          <section className="max-w-3xl mx-auto space-y-12">
            <div className="bg-white/50 border border-border/50 rounded-3xl p-8 md:p-12 space-y-6">
              <h2 className="text-3xl font-display font-bold text-foreground">Why Compress JPEG Images?</h2>
              <p className="text-muted-foreground leading-relaxed">
                JPEG is the most common format for photographs online. PixelPress compresses JPEG files intelligently, reducing file size by 50-80% while maintaining photo quality that's imperceptible to the human eye.
              </p>

              <h2 className="text-3xl font-display font-bold text-foreground mt-8">JPEG Compression Benefits</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Dramatically reduce file sizes (often 60-80% smaller)</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Perfect for photographs and realistic images</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Faster social media uploads</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Better mobile performance</li>
              </ul>

              <h2 className="text-3xl font-display font-bold text-foreground mt-8">Who Should Use JPEG Compression?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Photographers, ecommerce businesses, travel bloggers, real estate agents, and social media managers use JPEG compression to optimize photos for web and social platforms while maintaining professional quality.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto pt-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-white/50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline">Is my data safe?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. Unlike other tools that upload your images to a server, PixelPress runs entirely in your web browser. Your images never leave your computer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-white/50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline">Does it support bulk compression?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Currently we focus on single-image optimization to provide the best possible visual comparison tools. Bulk processing is on our roadmap!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-white/50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline">Which formats are supported?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We support input and output for JPG, PNG, and WebP formats. We recommend WebP for the best balance of quality and file size on the web.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
