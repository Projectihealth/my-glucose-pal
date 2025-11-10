import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHighlights } from "@/components/HeroHighlights";
import { Features } from "@/components/Features";

const OliviaOverview = () => (
  <div className="min-h-full bg-white">
    <section className="px-6 pt-6 pb-4">
      <Button variant="ghost" asChild className="px-0">
        <Link to="/learn-more" className="inline-flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Link>
      </Button>
    </section>

    <section className="px-6 space-y-4 pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">Meet My Glucose Pal</p>
      <h1 className="text-3xl font-bold leading-tight">How Olivia keeps you a step ahead</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Olivia blends CGM data, personal preferences, and community knowledge to deliver proactive nudges and education. Here&apos;s a closer look at the experience you saw on the home screen and how it adapts throughout the day.
      </p>
    </section>

    <section className="px-6 pb-12 space-y-10">
      <HeroHighlights />
      <Features />
    </section>
  </div>
);

export default OliviaOverview;
