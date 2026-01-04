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

export default function CompressWebP() {
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
      a.download = `${originalFile?.name?.split('.')[0] || 'image'}-compressed.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>Convert to WebP & Compress – Free Online Tool | PixelPress</title>
        <meta name="description" content="Convert images to WebP and compress online. WebP is 25-35% smaller than JPEG/PNG. Free, secure, browser-based conversion tool." />
        <meta name="keywords" content="webp converter, convert to webp, compress webp, online image converter, webp optimization" />
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
                Convert to WebP <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                  The Modern Image Format
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                WebP is 25-35% smaller than JPEG or PNG while maintaining superior quality. Perfect for modern web applications.
              </p>
            </motion.div>
            
            {!originalFile && (
              <div className="mt-8">
                <UploadZone onFileSelect={handleFileSelect} />
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
                    <h3 className="text-xl font-bold">Optimizing your WebP...</h3>
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
                <h2 className="text-3xl font-display font-bold text-foreground">Why Use WebP Format?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  WebP is a modern image format developed by Google that provides superior compression compared to JPEG and PNG. Supported by all modern browsers, WebP is the recommended format for web applications in 2025.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold text-foreground text-center sm:text-left">WebP Advantages</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Smaller Files", desc: "25-35% smaller than standard formats." },
                    { icon: Cpu, title: "Lossless Support", desc: "Crystal clear quality with transparency." },
                    { icon: Sliders, title: "Core Web Vitals", desc: "Boost your LCP and Performance scores." },
                    { icon: Monitor, title: "Modern Standard", desc: "Supported by Chrome, Safari and Firefox." }
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
                <h2 className="text-3xl font-display font-bold text-foreground">Who Should Convert to WebP?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Web developers, digital agencies, Next.js and React developers, and high-traffic websites should use WebP to improve Core Web Vitals scores and provide faster loading times to users globally.
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
                <AccordionTrigger className="font-medium hover:no-underline text-left">1. What is WebP image format?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  WebP is a modern image format developed by Google that offers smaller file sizes with high quality.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">2. Why should I convert images to WebP?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  WebP images load faster and improve website performance without noticeable quality loss.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">3. Can I convert PNG and JPEG to WebP?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. PixelPress supports converting both PNG and JPEG images to WebP.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">4. Does WebP support transparency?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. WebP supports transparency similar to PNG.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">5. Are WebP images supported by browsers?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Most modern browsers like Chrome, Edge, Firefox, and Safari support WebP.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">6. Will converting to WebP reduce quality?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PixelPress optimizes WebP conversion to maintain visual quality while reducing size.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">7. Is WebP good for SEO?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Faster-loading images improve Core Web Vitals, which can help SEO.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">8. Are images uploaded during WebP conversion?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Conversion happens fully in your browser, ensuring privacy.
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
