import { JpgToPdfTool } from "@/components/JpgToPdfTool";
import { motion } from "framer-motion";
import { SeoContent } from "@/components/SeoContent";
import { RelatedTools } from "@/components/RelatedTools";
import { seoData } from "@/data/seoContent";

export default function JpgToPdfPage() {
  return (
    <main className="pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            JPG to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">PDF</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional image-to-document conversion. Advanced control over orientation, margins, and merging.
          </p>
        </motion.div>

        <JpgToPdfTool />
        
        <SeoContent data={seoData["jpg-to-pdf"] as any} />
        
        <RelatedTools currentTool="jpg-to-pdf" />
      </div>
    </main>
  );
}
