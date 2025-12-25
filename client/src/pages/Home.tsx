import { useState } from "react";
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
import { Zap, Lock, Sliders, Monitor } from "lucide-react";

export default function Home() {
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
      a.download = `compressed-${originalFile?.name || 'image'}`;
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
              <div className="inline-flex items-center gap-2 bg-white/50 border border-black/5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Browser-based processing
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Compress images <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                   without losing quality.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Reduce file size up to 90% instantly. Secure, private, and runs entirely in your browser. No server uploads, ever.
              </p>
            </motion.div>
            
            {!originalFile && (
              <div className="mt-12">
                <UploadZone onFileSelect={handleFileSelect} />
              </div>
            )}
          </section>

          {/* Main Tool Section */}
          <AnimatePresence>
            {originalFile && previewUrl && originalPreviewUrl && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-6xl mx-auto"
                id="tool"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Controls */}
                  <div className="lg:col-span-4 order-2 lg:order-1">
                     <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/5 rounded-3xl p-6 sticky top-24">
                        <Controls settings={settings} onChange={setSettings} />
                     </div>
                  </div>

                  {/* Right Column: Preview & Actions */}
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

          {/* Features Grid */}
          <section id="features" className="max-w-5xl mx-auto pt-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-bold mb-4">Why use PixelPress?</h2>
              <p className="text-muted-foreground">Everything you need to optimize your images for the web.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Lock,
                  title: "100% Private",
                  desc: "Images never leave your device. All processing happens locally in your browser."
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  desc: "Powered by modern WebAssembly and browser APIs for instant results."
                },
                {
                  icon: Sliders,
                  title: "Full Control",
                  desc: "Adjust quality, change formats, and resize dimensions to your exact needs."
                },
                {
                  icon: Monitor,
                  title: "PWA Ready",
                  desc: "Install as an app on your device for offline access anytime."
                }
              ].map((feat, i) => (
                <div key={i} className="group p-6 rounded-3xl bg-white border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="max-w-3xl mx-auto pt-16">
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
