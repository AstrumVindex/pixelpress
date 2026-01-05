import ScrollToTop from "@/components/ScrollToTop";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const CompressPNG = lazy(() => import("@/pages/CompressPNG"));
const CompressJPEG = lazy(() => import("@/pages/CompressJPEG"));
const CompressWebP = lazy(() => import("@/pages/CompressWebP"));
const ResizeImage = lazy(() => import("@/pages/ResizeImage"));
const Converter = lazy(() => import("@/pages/Converter"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/compress-png" component={CompressPNG} />
        <Route path="/compress-jpeg" component={CompressJPEG} />
        <Route path="/compress-webp" component={CompressWebP} />
        <Route path="/resize-image" component={ResizeImage} />
        <Route path="/converter" component={Converter} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pixelpress-theme">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


export default App;
