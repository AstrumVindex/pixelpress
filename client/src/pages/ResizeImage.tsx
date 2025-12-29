import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { Controls } from "@/components/Controls";
import { ComparisonView } from "@/components/ComparisonView";
import { useImageCompressor } from "@/hooks/use-image-compressor";
import { motion, AnimatePresence } from "framer-motion";

export default function ResizeImage() {
  useEffect(() => {
    document.title = "Resize Images Online – Free Bulk Image Resizer | PixelPress";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Resize images online for free. Compress and resize photos for web, social media, and documents. Maintain aspect ratio automatically.");
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
      const formatMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
      };
      const extension = formatMap[settings.format] || 'jpg';
      const url = URL.createObjectURL(compressedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFile?.name?.split('.')[0] || 'image'}-resized.${extension}`;
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
                Resize Images <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                  For Any Purpose
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Resize images to exact dimensions while compressing. Perfect for web, social media, passports, and document requirements.
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
              <h2 className="text-3xl font-display font-bold text-foreground">Why Resize Images?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Different platforms and purposes require different image dimensions. PixelPress resizes images to exact specifications while intelligently compressing them, saving bandwidth and storage space.
              </p>

              <h2 className="text-3xl font-display font-bold text-foreground mt-8">Common Resizing Needs</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Social media (1200x630 for Facebook, 1024x512 for Twitter)</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Website hero images and thumbnails</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Passport photo specifications</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Email signatures and avatars</li>
              </ul>

              <h2 className="text-3xl font-display font-bold text-foreground mt-8">Who Should Resize Images?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Social media managers, content creators, web developers, ecommerce sellers, and anyone needing to optimize images for specific platforms or document requirements benefit from image resizing combined with compression.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
