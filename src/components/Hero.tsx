import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroProps {
  showActions?: boolean;
}

export const Hero = ({ showActions = true }: HeroProps) => {
  return (
    <section className="gradient-hero px-6 pt-16 pb-12">
      <div className="max-w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Your Personal Health AI</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight leading-tight">
          Welcome back, John
          <span className="block gradient-primary bg-clip-text text-transparent">
            
          </span>
        </h1>

        <p className="text-base text-muted-foreground">
          Dive into your real-time CGM insights and chat with Olivia in the palm of your hand.
        </p>

        {showActions && (
          <div className="flex flex-col gap-3 pt-6" data-landing-actions>
            <Button
              size="lg"
              asChild
              className="gradient-primary text-white border-0 shadow-lg hover:shadow-xl transition-all w-full"
            >
              <Link to="/coach">
                Chat with Olivia
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link to="/learn-more">Learn More</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
