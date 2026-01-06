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
import { useLocation } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CompressJPEG() {
  const [location, setLocation] = useLocation();
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

  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.file && !originalFile) {
      handleFileSelect(state.file);
      // Clear the state to prevent re-loading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [handleFileSelect, originalFile]);

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
      <Helmet>
        <title>Compress JPEG Images Online – Free & Secure | PixelPress</title>
        <meta name="description" content="Compress JPEG images online without losing quality. Fast, secure, browser-based JPEG compressor. No server uploads, 100% private." />
        <meta name="keywords" content="compress jpeg, jpg optimizer, online jpeg tool, resize jpg, image compression" />
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
                Compress JPEG Images <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                  Without Losing Quality
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Reduce JPEG file size dramatically while maintaining visual quality. Perfect for photos and realistic images.
              </p>
            </motion.div>
            
            {!originalFile && (
              <div className="mt-8">
                <UploadZone 
                  onFileSelect={handleFileSelect} 
                  accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }}
                  allowedFormats="JPEG"
                  errorMessage="Please upload a JPEG image"
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
                    <h3 className="text-xl font-bold">Optimizing your JPEG...</h3>
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
                <h2 className="text-3xl font-display font-bold text-foreground">Why Compress JPEG Images?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  JPEG is the most common format for photographs online. PixelPress compresses JPEG files intelligently, reducing file size by 50-80% while maintaining photo quality that's imperceptible to the human eye.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold text-foreground text-center sm:text-left">JPEG Compression Benefits</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Faster Speed", desc: "Instantly reduce photo file sizes for web." },
                    { icon: Cpu, title: "Quality Preservation", desc: "Maintain professional photo standards." },
                    { icon: Sliders, title: "Social Ready", desc: "Perfect for Instagram, Facebook and more." },
                    { icon: Monitor, title: "SEO Optimized", desc: "Faster images mean better Google rankings." }
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
                <h2 className="text-3xl font-display font-bold text-foreground">Who Should Use JPEG Compression?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Photographers, ecommerce businesses, travel bloggers, real estate agents, and social media managers use JPEG compression to optimize photos for web and social platforms while maintaining professional quality.
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
              <AccordionItem value="item-5" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">5. When should I use JPEG compression?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  JPEG is best for photos, portraits, and complex images with many colors.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">6. Can I control the compression level?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Depending on the tool settings, you may adjust quality to balance size and clarity.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">7. Is JPEG compression suitable for social media?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Compressed JPEGs are perfect for faster uploads and sharing on social platforms.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">8. Does JPEG compression remove metadata?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Some metadata may be removed to reduce file size and protect privacy.
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
