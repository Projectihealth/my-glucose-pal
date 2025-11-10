import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Apple, Moon, TrendingUp } from "lucide-react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useGlucoseTrend } from "@/hooks/useGlucoseTrend";

interface DashboardProps {
  selectedDay: string | null;
}

export const Dashboard = ({ selectedDay }: DashboardProps) => {
  const { preferences } = useUserPreferences();
  const { points, loading, updateIntervalMinutes } = useGlucoseTrend(
    preferences.locale,
    preferences.timezone,
    selectedDay,
  );
  const stepMinutes = updateIntervalMinutes ?? 5;

  const timeInRange = useMemo(() => {
    if (!points.length) return null;

    let totalMinutes = 0;
    let inRangeMinutes = 0;

    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const next = points[i + 1];
      const delta = next
        ? Math.max(1, (next.timestamp - current.timestamp) / 60000)
        : stepMinutes;
      totalMinutes += delta;
      if (current.glucose >= 70 && current.glucose <= 140) {
        inRangeMinutes += delta;
      }
    }

    const percentage = totalMinutes ? (inRangeMinutes / totalMinutes) * 100 : 0;
    return {
      percentage: percentage.toFixed(1),
      minutes: Math.round(inRangeMinutes),
    };
  }, [points, stepMinutes]);

  const segments = useMemo(() => {
    const buckets = [
      { label: "Night (0-6)", start: 0, end: 360 },
      { label: "Morning (6-12)", start: 360, end: 720 },
      { label: "Afternoon (12-18)", start: 720, end: 1080 },
      { label: "Evening (18-24)", start: 1080, end: 1440 },
    ];

    if (!points.length) {
      return buckets.map((bucket) => ({ label: bucket.label, score: 0, status: "--" }));
    }

    return buckets.map((bucket) => {
      let totalMinutes = 0;
      let minutesInRange = 0;

      for (let i = 0; i < points.length; i += 1) {
        const current = points[i];
        if (current.minutesOfDayUtc < bucket.start || current.minutesOfDayUtc >= bucket.end) continue;

        const next = points[i + 1];
        const nextMinutes = next ? Math.min(next.minutesOfDayUtc, bucket.end) : bucket.end;
        let delta = next
          ? Math.max(1, (next.timestamp - current.timestamp) / 60000)
          : stepMinutes;

        const remainingWithinBucket = Math.max(0, nextMinutes - current.minutesOfDayUtc);
        if (remainingWithinBucket > 0) {
          delta = Math.min(delta, remainingWithinBucket);
        }

        totalMinutes += delta;
        if (current.glucose >= 70 && current.glucose <= 140) {
          minutesInRange += delta;
        }
      }

      const percentage = totalMinutes ? (minutesInRange / totalMinutes) * 100 : 0;
      const status = percentage >= 80 ? "Excellent" : percentage >= 60 ? "Good" : percentage >= 40 ? "Moderate" : "Needs attention";

      return {
        label: bucket.label,
        score: Math.round(percentage),
        status,
      };
    });
  }, [points, stepMinutes]);

  return (
    <section className="px-6 py-8 bg-muted/40">
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Daily Snapshot</h2>
          <p className="text-sm text-muted-foreground">Key vitals from the selected day.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-5 rounded-3xl border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Time in range</p>
                  <p className="text-xl font-semibold">
                    {loading || !timeInRange ? "--" : `${timeInRange.percentage}%`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {loading || !timeInRange
                      ? "Calculating..."
                      : `${timeInRange.minutes} minutes between 70-140 mg/dL`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Selected day</span>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Active days</p>
                  <p className="text-xl font-semibold">10</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">This month</span>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Nutrition score</p>
                  <p className="text-xl font-semibold">8 / 10</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-chart-4 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Sleep quality</p>
                  <p className="text-xl font-semibold" style={{ color: "hsl(var(--chart-4))" }}>7.5h</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Average</span>
            </div>
          </Card>
        </div>

        <Card className="p-5 rounded-3xl border-border/60">
          <h3 className="text-lg font-semibold mb-4">Daily Patterns</h3>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div key={segment.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span>{segment.label}</span>
                  <span className="text-muted-foreground">{segment.status}</span>
                </div>
                <Progress value={segment.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
