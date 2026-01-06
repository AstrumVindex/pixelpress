import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { ResizeControls } from "@/components/ResizeControls";
import { ComparisonView } from "@/components/ComparisonView";
import { CropDialog } from "@/components/CropDialog";
import { useImageCompressor } from "@/hooks/use-image-compressor";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Cpu, Sliders, Monitor, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ResizeImage() {
  const [, setLocation] = useLocation();
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
  } = useImageCompressor(true); // Enable resize-only mode

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>();

  const handleCompressRedirect = () => {
    if (!compressedFile) return;

    const type = compressedFile.type;
    
    // Pass the resized file via router state
    const navigationOptions = { state: { file: compressedFile } };

    if (type === "image/png") {
      setLocation("/compress-png", navigationOptions);
    } else if (type === "image/jpeg") {
      setLocation("/compress-jpeg", navigationOptions);
    } else if (type === "image/webp") {
      setLocation("/compress-webp", navigationOptions);
    }
  };

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else {
      setOriginalDimensions(undefined);
    }
  }, [originalFile]);

  // On resize page, default compression to OFF when file is selected
  useEffect(() => {
    if (originalFile && settings.enableCompression === undefined) {
      setSettings(prev => ({ ...prev, enableCompression: false }));
    }
  }, [originalFile, settings.enableCompression, setSettings]);

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
      <Helmet>
        <title>Resize Images Online – Free Bulk Image Resizer | PixelPress</title>
        <meta name="description" content="Resize images online for free. Compress and resize photos for web, social media, and documents. Maintain aspect ratio automatically." />
        <meta name="keywords" content="resize image, online image resizer, change image dimensions, photo resizer, bulk image resizer" />
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
                Resize Images <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                  For Any Purpose
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Resize images to exact dimensions while compressing. Perfect for web, social media, passports, and document requirements.
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
                    <h3 className="text-xl font-bold">Resizing your image...</h3>
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
                      <ResizeControls 
                        settings={settings} 
                        onChange={setSettings} 
                        onOpenCrop={() => setCropDialogOpen(true)}
                        originalDimensions={originalDimensions}
                      />
                    </div>
                  </div>

                  <CropDialog
                    open={cropDialogOpen}
                    onOpenChange={setCropDialogOpen}
                    image={originalPreviewUrl}
                    onCropComplete={(croppedBlob) => {
                      const file = new File([croppedBlob], originalFile?.name || "cropped.jpg", { type: "image/jpeg" });
                      handleFileSelect(file);
                    }}
                  />

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
                        showDownload={true}
                        isResizeMode={true}
                      />

                      {compressedFile && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                          <div className="text-center sm:text-left">
                            <h4 className="font-bold text-lg">Resize Complete!</h4>
                            <p className="text-sm text-muted-foreground">Want to reduce the file size too?</p>
                          </div>
                          <Button 
                            onClick={handleCompressRedirect}
                            className="w-full sm:w-auto rounded-xl gap-2 h-12 px-6"
                          >
                            Compress This Image
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
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
                <h2 className="text-3xl font-display font-bold text-foreground">Why Resize Images?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Different platforms and purposes require different image dimensions. PixelPress resizes images to exact specifications while intelligently compressing them, saving bandwidth and storage space.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold text-foreground text-center sm:text-left">Common Resizing Needs</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Social Media", desc: "Perfect sizes for FB, Twitter and Insta." },
                    { icon: Cpu, title: "Web Assets", desc: "Hero images, thumbs and icon sizes." },
                    { icon: Sliders, title: "Custom Sizes", desc: "Exact pixel dimensions as required." },
                    { icon: Monitor, title: "Bulk Scaling", desc: "Maintain aspect ratio automatically." }
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
                <h2 className="text-3xl font-display font-bold text-foreground">Who Should Resize Images?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Social media managers, content creators, web developers, ecommerce sellers, and anyone needing to optimize images for specific platforms or document requirements benefit from image resizing combined with compression.
                </p>
              </div>

              <div className="pt-8 flex justify-center">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Resize Your Images Now
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto pt-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">FAQs</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">1. What does image resizing mean?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Image resizing changes the dimensions (width and height) of an image without changing its format.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">2. Does resizing reduce image quality?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Reducing dimensions may slightly affect quality, but PixelPress minimizes distortion.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">3. Can I resize images without compressing them?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. You can resize images independently without applying compression.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">4. Which formats can be resized?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PixelPress supports resizing PNG, JPEG, and WebP images.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">5. Is aspect ratio maintained during resize?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can choose to lock or unlock aspect ratio depending on your needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">6. Are resized images processed online?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Resizing is done locally in your browser for privacy and speed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">7. Can I resize images for social media?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Image resizing is ideal for preparing images for social media, websites, and profiles.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">8. Will resizing remove metadata?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Some metadata may be removed during processing to reduce file size.
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
