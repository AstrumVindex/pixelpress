import { FileConverter } from "@/components/FileConverter";

export default function PdfToJpg() {
  return (
    <main className="pt-24 pb-20 px-4 md:px-6">
      <FileConverter inputFormat="pdf" outputFormat="jpg" seoKey="pdf-to-jpg" />
    </main>
  );
}
