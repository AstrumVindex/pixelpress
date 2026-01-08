import { FileConverter } from "@/components/FileConverter";

export default function JpgToPng() {
  return (
    <main className="pt-24 pb-20 px-4 md:px-6">
      <FileConverter inputFormat="jpg" outputFormat="png" seoKey="jpg-to-png" />
    </main>
  );
}
