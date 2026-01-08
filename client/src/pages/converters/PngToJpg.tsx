import { FileConverter } from "@/components/FileConverter";

export default function PngToJpg() {
  return (
    <main className="pt-24 pb-20 px-4 md:px-6">
      <FileConverter inputFormat="png" outputFormat="jpg" seoKey="png-to-jpg" />
    </main>
  );
}
