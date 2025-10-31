import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const nutritionBullets = [
  "Sample breakfast, lunch, and dinner templates with macronutrient guidance.",
  "Timing tips for pre-bolus, movement, and evening snacks.",
  "Journal prompts to capture how different meals impact your CGM.",
];

const NutritionPlaybook = () => (
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
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">Nutrition Playbook</p>
      <h1 className="text-3xl font-bold leading-tight">Build a glucose-friendly plate</h1>
      <p className="text-sm text-muted-foreground">
        Combine fiber, protein, and smart carbs to keep curves steady. Pair these strategies with Olivia&apos;s meal reminders for effortless follow-through.
      </p>
      <div className="space-y-3 text-sm text-muted-foreground">
        {nutritionBullets.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </section>
  </div>
);

export default NutritionPlaybook;
