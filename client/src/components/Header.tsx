import { Zap, Mail } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
          <div className="bg-primary/10 p-1.5 rounded-full text-primary">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Pixel<span className="text-primary">Press</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 glass-panel px-6 py-2 rounded-full text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
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
