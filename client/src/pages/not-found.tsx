import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sorry! The page you're looking for doesn't exist. Let's get you back on track.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setLocation("/")}
              size="lg"
              className="w-full gap-2"
              data-testid="button-go-home"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
            
            <Button 
              onClick={() => {
                const element = document.getElementById("features");
                if (element) element.scrollIntoView({ behavior: "smooth" });
                else setLocation("/#features");
              }}
              variant="outline"
              size="lg"
              className="w-full"
              data-testid="button-features"
            >
              Explore Features
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Need help? <a href="mailto:pixelpresshelp4u@gmail.com" className="text-primary hover:underline">Contact support</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
