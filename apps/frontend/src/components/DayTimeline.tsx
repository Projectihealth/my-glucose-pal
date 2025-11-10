import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Apple, Activity, MessageCircle, Moon } from "lucide-react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useActivityLog } from "@/context/ActivityLogContext";
import { useGlucoseCalendarData, useGlucoseDaySeries } from "@/hooks/useGlucoseTrend";
import type { GlucoseTrendPoint } from "@/hooks/useGlucoseTrend";
import { ResponsiveContainer, Area, AreaChart, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface DayTimelineProps {
  selectedDay: string | null;
}

interface TimelineItem {
  id: string;
  label: string;
  description?: string;
  minutesOfDay: number;
  kind: "meal" | "activity" | "chat" | "sleep";
  durationMinutes?: number;
}

const minutesToPercent = (minutes: number) => `${(minutes / 1440) * 100}%`;

const hashDay = (day: string) => day.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const buildSleepSegments = (day: string) => {
  const hash = hashDay(day);
  const start = 30 + (hash % 60);
  const duration = 360 + (hash % 90);
  return [
    {
      id: `${day}-sleep`,
      label: "Sleep",
      minutesOfDay: start,
      durationMinutes: Math.min(duration, 600),
      kind: "sleep" as const,
    },
  ];
};

const buildChatEntries = (day: string) => {
  const hash = hashDay(day);
  const base = (hash % 600) + 480; // between 8am-6pm
  return [
    {
      id: `${day}-chat-1`,
      label: "Butler check-in",
      description: "You reflected on afternoon energy dip.",
      minutesOfDay: base,
      kind: "chat" as const,
    },
    {
      id: `${day}-chat-2`,
      label: "Coaching prompt",
      description: "Olivia suggested a gentle walk.",
      minutesOfDay: Math.min(base + 120, 1320),
      kind: "chat" as const,
    },
  ];
};

const buildLogItems = (day: string, logs: ReturnType<typeof useActivityLog>["logs"]) => {
  return logs
    .filter((log) => log.day === day)
    .map((log) => ({
      id: log.id,
      label: log.title,
      description: log.note,
      minutesOfDay: log.minutesOfDayUtc,
      kind: log.category === "food" ? "meal" : "activity",
    }));
};

const prepareTimelineItems = (day: string, logs: ReturnType<typeof useActivityLog>["logs"]) => {
  const items: TimelineItem[] = [...buildLogItems(day, logs), ...buildSleepSegments(day), ...buildChatEntries(day)];
  return items.sort((a, b) => a.minutesOfDay - b.minutesOfDay);
};

const formatMinutes = (minutes: number, locale: string) => {
  const clamped = Math.max(0, Math.min(1439, minutes));
  const date = new Date(Date.UTC(1970, 0, 1, 0, clamped));
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
};

const buildChartData = (points: GlucoseTrendPoint[]) =>
  points.map((point) => ({
    minutes: point.minutesOfDayUtc,
    glucose: point.glucose,
  }));

export const DayTimeline = ({ selectedDay }: DayTimelineProps) => {
  const { preferences } = useUserPreferences();
  const { logs } = useActivityLog();
  const { points, loading } = useGlucoseDaySeries(preferences.locale, selectedDay);
  const { summaries } = useGlucoseCalendarData(preferences.locale);

  if (!selectedDay) {
    return (
      <Card className="mx-6 mt-6 p-6 rounded-3xl border-dashed border-border text-muted-foreground">
        Select any day on the calendar to explore how meals, movement, and chats influenced your glucose curve.
      </Card>
    );
  }

  const timelineItems = useMemo(() => prepareTimelineItems(selectedDay, logs), [selectedDay, logs]);
  const chartData = useMemo(() => buildChartData(points), [points]);
  const summary = summaries[selectedDay];

  return (
    <Card className="mx-6 mt-6 rounded-3xl border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily view</p>
          <h2 className="text-2xl font-semibold">
            {new Intl.DateTimeFormat(preferences.locale, { dateStyle: "full" }).format(
              parseDay(selectedDay),
            )}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          Avg {summary ? summary.avgGlucose.toFixed(0) : "--"} mg/dL · {timelineItems.length} moments
        </div>
      </div>

      <div className="relative h-64 rounded-3xl border border-border/60 bg-background/80">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
              <YAxis hide domain={[60, 200]} />
              <Area type="monotone" dataKey="glucose" stroke="hsl(var(--primary))" fill="url(#timelineArea)" strokeWidth={2} />
              <defs>
                <linearGradient id="timelineArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute inset-0 px-4">
          <div className="relative h-full">
            {timelineItems.map((item) => {
              const Icon = item.kind === "meal" ? Apple : item.kind === "activity" ? Activity : item.kind === "chat" ? MessageCircle : Moon;
              const colorClass =
                item.kind === "meal"
                  ? "bg-amber-100 text-amber-900"
                  : item.kind === "activity"
                    ? "bg-emerald-100 text-emerald-900"
                    : item.kind === "chat"
                      ? "bg-sky-100 text-sky-900"
                      : "bg-slate-800/80 text-white";

              if (item.kind === "sleep" && item.durationMinutes) {
                return (
                  <div
                    key={item.id}
                    className="absolute top-6 flex flex-col items-center"
                    style={{
                      left: minutesToPercent(item.minutesOfDay),
                      width: minutesToPercent(item.durationMinutes),
                    }}
                  >
                    <div className="h-8 w-full rounded-xl bg-slate-900/70 text-white text-xs flex items-center justify-center gap-1">
                      <Moon className="w-3 h-3" />
                      <span>Sleep</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="absolute bottom-4 flex flex-col items-center"
                  style={{ left: minutesToPercent(item.minutesOfDay) }}
                >
                  <div className={cn("rounded-2xl px-3 py-2 text-xs shadow-lg", colorClass)}>
                    <div className="flex items-center gap-1 font-semibold">
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </div>
                    <p className="text-[11px] opacity-80">{item.description ?? formatMinutes(item.minutesOfDay, preferences.locale)}</p>
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    {formatMinutes(item.minutesOfDay, preferences.locale)}
                  </span>
                </div>
              );
            })}

            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-muted-foreground px-2 pb-1">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <p className="mt-3 text-xs text-muted-foreground">Loading CGM details…</p>
      )}
    </Card>
  );
};

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
