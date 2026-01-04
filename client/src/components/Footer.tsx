import { ShieldCheck, Heart } from "lucide-react";
import { Link } from "wouter";
import { memo } from "react";

export const Footer = memo(function Footer() {
  return (
    <footer className="bg-white border-t border-border/50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              Pixel<span className="text-primary">Press</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Professional browser-based image compression. 
              We believe in privacy, speed, and quality.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/compress-png" className="hover:text-primary transition-colors">Compress PNG</Link></li>
              <li><Link href="/compress-jpeg" className="hover:text-primary transition-colors">Compress JPEG</Link></li>
              <li><Link href="/compress-webp" className="hover:text-primary transition-colors">Convert to WebP</Link></li>
              <li><Link href="/resize-image" className="hover:text-primary transition-colors">Resize Image</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border space-y-4">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg text-xs font-semibold text-primary">
              <ShieldCheck className="w-4 h-4" />
              100% Browser-Based
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg text-xs font-semibold text-primary">
              <ShieldCheck className="w-4 h-4" />
              No Server Uploads
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg text-xs font-semibold text-primary">
              <ShieldCheck className="w-4 h-4" />
              Privacy First
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
            <span>© 2025 PixelPress. Made with <Heart className="w-4 h-4 text-red-500 fill-current inline" /> for privacy-conscious developers.</span>
            <a href="mailto:pixelpresshelp4u@gmail.com" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
});
