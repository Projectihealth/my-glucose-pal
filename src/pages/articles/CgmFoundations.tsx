import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const bulletItems = [
  "Decode metrics like TIR, GMI, and variability in plain language.",
  "Understand how often to log meals or insulin to give Olivia better context.",
  "Follow a morning checklist for sensor warmups, site changes, and calibration.",
];

const CgmFoundations = () => (
  <div className="min-h-full bg-white">
    <section className="px-6 pt-6 pb-4">
      <Button variant="ghost" asChild className="px-0">
        <Link to="/learn-more" className="inline-flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Link>
      </Button>
    </section>

    <section className="px-6 space-y-4 pb-12 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">CGM Foundations</p>
      <h1 className="text-3xl font-bold leading-tight">Continuous Glucose Monitoring 101</h1>
      <p className="text-sm text-muted-foreground">
        Learn what your sensor is measuring, which alerts matter most, and how to sync Olivia&apos;s coaching with real-time data. We cover time in range, variability, calibration, and how to act on overnight trends.
      </p>
      <div className="space-y-3 text-sm text-muted-foreground">
        {bulletItems.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </section>
  </div>
);

export default CgmFoundations;
