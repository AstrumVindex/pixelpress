import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { Controls } from "@/components/Controls";
import { ComparisonView } from "@/components/ComparisonView";
import { useImageCompressor } from "@/hooks/use-image-compressor";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Cpu, Sliders, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CompressPNG() {
  const {
    originalFile,
    compressedFile,
    isCompressing,
    progress,
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
      a.download = `${originalFile?.name?.split('.')[0] || 'image'}-compressed.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>Compress PNG Images Online – Free & Secure | PixelPress</title>
        <meta name="description" content="Compress PNG images online without losing quality. Fast, secure, browser-based PNG compressor. No server uploads, 100% private." />
        <meta name="keywords" content="compress png, png optimizer, transparent png compression, online png tool, resize png" />
      </Helmet>
      <Header />
      
      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Compress PNG Images <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                  Without Losing Quality
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Reduce PNG file size while preserving transparency and quality. Fast, secure, and runs entirely in your browser.
              </p>
            </motion.div>
            
            {!originalFile && (
              <div className="mt-8">
                <UploadZone 
                  onFileSelect={handleFileSelect} 
                  accept={{ 'image/png': ['.png'] }}
                  allowedFormats="PNG"
                  errorMessage="Please upload a PNG image"
                />
              </div>
            )}

            {originalFile && !previewUrl && (
              <div className="mt-12 max-w-2xl mx-auto">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-10 text-center space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <motion.div 
                      className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">
                      {progress}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Optimizing your PNG...</h3>
                    <p className="text-muted-foreground">This happens entirely in your browser.</p>
                  </div>
                </div>
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
          <section className="bg-slate-50 dark:bg-slate-900/50 -mx-4 md:-mx-6 py-16 md:py-20">
            <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-12">
              <div className="space-y-6 text-center sm:text-left">
                <h2 className="text-3xl font-display font-bold text-foreground">Why Compress PNG Images?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  PNG is excellent for graphics with transparency, but files can be large. PixelPress intelligently compresses PNG files while preserving transparency and maintaining visual quality.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold text-foreground text-center sm:text-left">PNG Compression Benefits</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Faster Speed", desc: "Significantly faster website load times." },
                    { icon: Cpu, title: "Lower Bandwidth", desc: "Reduce data usage for your users." },
                    { icon: Sliders, title: "Better SEO", desc: "Google rewards faster loading websites." },
                    { icon: Monitor, title: "Mobile Ready", desc: "Improved experience on mobile devices." }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl border border-border/50 shadow-sm hover-elevate transition-all">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 text-center sm:text-left">
                <h2 className="text-3xl font-display font-bold text-foreground">Who Should Use PNG Compression?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Web developers, graphic designers, ecommerce sellers, bloggers, and anyone sharing images online benefit from PNG compression to improve load times and user experience.
                </p>
              </div>

              <div className="pt-8 flex justify-center">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Compress Your Images Now
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto pt-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">FAQs</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">1. What is PNG image compression?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PNG compression reduces the file size of a PNG image while keeping transparency and visual quality intact.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">2. Will transparency be preserved after PNG compression?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. PixelPress preserves alpha transparency when compressing PNG images.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">3. Is PNG compression lossless?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PixelPress uses lossless or near-lossless techniques for PNGs, so visual quality remains unchanged in most cases.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">4. Are PNG images uploaded to a server?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. PNG compression happens entirely in your browser. Images are never uploaded or stored.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">5. When should I use PNG instead of JPEG?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PNG is best for images with text, logos, icons, or transparency, where sharp edges are important.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">6. Does PNG compression work on mobile?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. You can compress PNG images on mobile devices using modern browsers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">7. Is there a file size limit for PNG compression?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  There is no fixed limit, but very large PNG files may take longer depending on your device.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">8. Can I use compressed PNGs for websites?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Compressed PNGs are ideal for websites and help improve page load speed.
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
