import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
}

interface RelatedToolsProps {
  currentTool?: string;
  limit?: number;
}

const allTools: Tool[] = [
  {
    id: "compress-png",
    name: "Compress PNG",
    description: "Reduce PNG file size without losing quality or transparency",
    href: "/compress-png",
    icon: "🖼️"
  },
  {
    id: "compress-jpeg",
    name: "Compress JPEG",
    description: "Optimize JPG images for web with adjustable quality settings",
    href: "/compress-jpeg",
    icon: "📷"
  },
  {
    id: "compress-webp",
    name: "Compress WebP",
    description: "Reduce WebP image size for faster web performance",
    href: "/compress-webp",
    icon: "⚡"
  },
  {
    id: "resize-image",
    name: "Resize Image",
    description: "Change dimensions and crop images for any platform",
    href: "/resize-image",
    icon: "↔️"
  },
  {
    id: "png-to-jpg",
    name: "PNG to JPG",
    description: "Convert PNG images to JPG format with high quality",
    href: "/png-to-jpg",
    icon: "🔄"
  },
  {
    id: "jpg-to-png",
    name: "JPG to PNG",
    description: "Convert JPEG to PNG with transparent background support",
    href: "/jpg-to-png",
    icon: "🔄"
  },
  {
    id: "png-to-webp",
    name: "PNG to WebP",
    description: "Convert PNG to modern WebP format for better compression",
    href: "/png-to-webp",
    icon: "📦"
  },
  {
    id: "webp-to-png",
    name: "WebP to PNG",
    description: "Convert WebP images back to PNG format",
    href: "/webp-to-png",
    icon: "🔄"
  },
  {
    id: "webp-to-jpg",
    name: "WebP to JPG",
    description: "Convert WebP to JPG for wider compatibility",
    href: "/webp-to-jpg",
    icon: "🔄"
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Extract pages from PDF and convert to JPG images",
    href: "/pdf-to-jpg",
    icon: "📄"
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Merge multiple JPG images into a single PDF document",
    href: "/jpg-to-pdf",
    icon: "📑"
  },
  {
    id: "jfif-to-jpg",
    name: "JFIF to JPG",
    description: "Convert JFIF image files to standard JPG format",
    href: "/jfif-to-jpg",
    icon: "🔄"
  }
];

export const RelatedTools = ({ currentTool, limit = 4 }: RelatedToolsProps) => {
  // Filter out current tool and get random tools
  const filteredTools = allTools.filter(tool => tool.id !== currentTool);
  
  // Shuffle and limit to desired number
  const relatedTools = filteredTools
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  return (
    <section className="max-w-5xl mx-auto mt-24 mb-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-slate-900 dark:text-white">
          More Tools to Explore
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          PixelPress offers a complete suite of image processing tools. Try our other converters and optimizers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedTools.map((tool) => (
          <Link key={tool.id} href={tool.href}>
            <a className="group h-full">
              <div className="h-full p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{tool.icon}</span>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>
                
                <h3 className="font-display font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {tool.description}
                </p>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 group-hover:bg-primary/10"
                >
                  Try Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </a>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/all-converters">
          <a>
            <Button variant="outline" size="lg">
              View All Tools
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </Link>
      </div>
    </section>
  );
};
