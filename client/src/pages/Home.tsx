import { Helmet } from "react-helmet";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadZone } from "@/components/UploadZone";
import { Controls } from "@/components/Controls";
import { useImageCompressor } from "@/hooks/use-image-compressor";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Zap, Lock, Sliders, Monitor, Cpu, Lock as LockIcon, Server, Zap as ZapIcon, Download, Trash2, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function Home() {
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
          const ext = settings.format.split('/')[1] || 'jpg';
          zip.file(fileItem.name.replace(/\.[^/.]+$/, "") + `-compressed.${ext}`, fileItem.compressed);
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "pixelpress-compressed.zip");
    } catch (err) {
      console.error("ZIP creation failed", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>PixelPress - Free Online Image Compression Tool</title>
        <meta name="description" content="Compress, resize and convert images online for free. PixelPress is a private, browser-based tool that works locally without uploading your photos to a server." />
        <meta name="keywords" content="image compressor, online image tool, free image resize, png compressor, jpeg optimizer, webp converter" />
      </Helmet>
      <Header />
      
      <main className="pt-24 pb-20 px-4 md:px-6">
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
                Reduce file size while preserving quality. Secure, private, and runs entirely in your browser. No server uploads, ever.
              </p>
            </motion.div>
            
            <div className="mt-12">
              <UploadZone onFileSelect={handleFiles} />
            </div>
          </section>

          {/* Main Tool Section */}
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
                            <a href={file.previewUrl} download={`${file.name.split('.')[0]}-compressed.${settings.format.split('/')[1] || 'jpg'}`}>
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

          {/* About & Benefits Section */}
          <section className="max-w-4xl mx-auto pt-16 prose prose-sm max-w-none">
            <div className="bg-white/50 border border-border/50 rounded-3xl p-8 md:p-12 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-display font-bold text-foreground">About PixelPress</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  PixelPress is a free, fast, and secure image compression tool that helps you reduce file sizes without losing quality. 
                  Unlike traditional image compressors that upload your files to servers, PixelPress processes everything directly in your browser, 
                  ensuring 100% privacy and security for your images.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Supported Formats</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PixelPress supports compression and conversion for JPEG, PNG, and WebP image formats. 
                    You can upload any of these formats and convert to any other format while optimizing file size.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">100% Private</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your images never leave your device. All compression happens locally in your browser using modern web APIs. 
                    No files are uploaded, stored, or shared with any servers.
                  </p>
                </div>
              </div>
            </div>
          </section>

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
          <section id="faq" className="max-w-3xl mx-auto pt-16 pb-12">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">FAQs</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">1. What is PixelPress?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PixelPress is a free, browser-based image tool that helps you compress, convert, and resize images quickly without uploading them to a server.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">2. Is PixelPress really free to use?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. PixelPress is completely free and does not require sign-up, subscriptions, or hidden payments.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">3. Are my images safe and private?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. All image processing happens locally in your browser. Your images are never uploaded, stored, or shared.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-white/50 dark:bg-slate-800/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800 data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="font-medium hover:no-underline text-left">4. What image formats does PixelPress support?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  PixelPress supports PNG, JPEG (JPG), and WebP formats for compression, conversion, and resizing.
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
