import { MessageSquare, TrendingUp } from "lucide-react";

export const HeroHighlights = () => {
  return (
    <div className="grid grid-cols-1 gap-4 text-left">
      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Daily Insights</h3>
        <p className="text-sm text-muted-foreground">
          Wake up to one focused recommendation, tuned to your goals and yesterday&apos;s CGM data.
        </p>
      </div>

      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm">
        <div className="w-10 h-10 rounded-2xl gradient-secondary flex items-center justify-center mb-4">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Natural Conversations</h3>
        <p className="text-sm text-muted-foreground">
          Ask Olivia anything—log meals, share feelings, or get instant context about today&apos;s readings.
        </p>
      </div>

      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Proactive Predictions</h3>
        <p className="text-sm text-muted-foreground">
          Preview how upcoming meals or workouts may impact your glucose so you can decide with confidence.
        </p>
      </div>
    </div>
  );
};

export default HeroHighlights;
