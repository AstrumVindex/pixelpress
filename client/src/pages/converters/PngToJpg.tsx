import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileConverter } from "@/components/FileConverter";
import { SeoContent } from "@/components/SeoContent";
import { seoData } from "@/data/seoContent";

export default function PngToJpg() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      <main className="pt-24 pb-20 px-4 md:px-6">
        <FileConverter inputFormat="png" outputFormat="jpg" />
        <SeoContent data={seoData["png-to-jpg"] as any} />
      </main>
      <Footer />
    </div>
  );
}
