import { Zap, Mail, ChevronDown, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { memo, useState } from "react";

export const Header = memo(function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-1 sm:gap-2 glass-panel px-3 sm:px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
            <div className="bg-primary/10 p-1 sm:p-1.5 rounded-full text-primary">
              <Zap className="w-4 sm:w-5 h-4 sm:h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight hidden xs:inline">
              Pixel<span className="text-primary">Press</span>
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-4 glass-panel px-4 xl:px-6 py-2 rounded-full text-xs xl:text-sm font-medium text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors outline-none whitespace-nowrap">
              Compress Image <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border-border bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
              <DropdownMenuItem asChild>
                <Link href="/compress-png" className="cursor-pointer">Compress PNG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/compress-jpeg" className="cursor-pointer">Compress JPEG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/compress-webp" className="cursor-pointer">Compress WebP</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer font-semibold">All Formats</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors outline-none whitespace-nowrap">
              Format Converter <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border-border bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
              <DropdownMenuItem asChild>
                <Link href="/png-to-jpg" className="cursor-pointer">PNG → JPG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jpg-to-png" className="cursor-pointer">JPG → PNG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pdf-to-jpg" className="cursor-pointer">PDF → JPG</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jpg-to-pdf" className="cursor-pointer">JPG → PDF</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/all-converters" className="cursor-pointer font-semibold">All Converters</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/resize-image" className="hover:text-foreground transition-colors whitespace-nowrap">Resize</Link>
          
          <a href="#faq" className="hover:text-foreground transition-colors whitespace-nowrap">FAQ</a>
          <a href="mailto:pixelpresshelp4u@gmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors whitespace-nowrap">
            <Mail className="w-4 h-4" />
            Contact
          </a>
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-panel rounded-full w-9 h-9 sm:w-10 sm:h-10">
                <Menu className="w-5 sm:w-6 h-5 sm:h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left font-display font-bold text-xl flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  Pixel<span className="text-primary">Press</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compress Image</h4>
                  <Link href="/compress-png" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Compress PNG</Link>
                  <Link href="/compress-jpeg" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Compress JPEG</Link>
                  <Link href="/compress-webp" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Compress WebP</Link>
                  <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">All Formats</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Format Converter</h4>
                  <Link href="/png-to-jpg" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">PNG → JPG</Link>
                  <Link href="/jpg-to-png" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">JPG → PNG</Link>
                  <Link href="/pdf-to-jpg" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">PDF → JPG</Link>
                  <Link href="/jpg-to-pdf" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">JPG → PDF</Link>
                  <Link href="/all-converters" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">All Converters</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</h4>
                  <Link href="/resize-image" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Resize Image</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Support</h4>
                  <a href="#faq" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">FAQ</a>
                  <a href="mailto:pixelpresshelp4u@gmail.com" className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    Contact
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
});
