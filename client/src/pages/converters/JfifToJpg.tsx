import { Helmet } from "react-helmet";
import { FileConverter } from "@/components/FileConverter";

export default function JfifToJpg() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>JFIF to JPG Converter - Free Online Tool | PixelPress</title>
        <meta name="description" content="Convert JFIF images to JPG format for free. Bulk upload supported. Fast, secure, and 100% private - all processing happens in your browser." />
      </Helmet>
            <main className="pt-24 pb-20 px-4 md:px-6">
        <FileConverter inputFormat="jfif" outputFormat="jpg" seoKey="jfif-to-jpg" />
      </main>
    </div>
  );
}
