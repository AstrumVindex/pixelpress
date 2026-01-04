import ScrollToTop from "@/components/ScrollToTop";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import CompressPNG from "@/pages/CompressPNG";
import CompressJPEG from "@/pages/CompressJPEG";
import CompressWebP from "@/pages/CompressWebP";
import ResizeImage from "@/pages/ResizeImage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/compress-png" component={CompressPNG} />
      <Route path="/compress-jpeg" component={CompressJPEG} />
      <Route path="/compress-webp" component={CompressWebP} />
      <Route path="/resize-image" component={ResizeImage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ScrollToTop />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


export default App;
