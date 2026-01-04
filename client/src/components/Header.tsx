import { Zap, Mail, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
            <div className="bg-primary/10 p-1.5 rounded-full text-primary">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Pixel<span className="text-primary">Press</span>
            </span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4 glass-panel px-6 py-2 rounded-full text-sm font-medium text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors outline-none">
              Compress <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border-border bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
              <DropdownMenuItem asChild>
                <Link href="/compress-png" className="cursor-pointer">PNG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/compress-jpeg" className="cursor-pointer">JPEG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/compress-webp" className="cursor-pointer">WebP</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href="/resize-image" className="hover:text-foreground transition-colors">Resize</Link>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="mailto:pixelpresshelp4u@gmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Mail className="w-4 h-4" />
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
