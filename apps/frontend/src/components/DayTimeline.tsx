import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Dumbbell, Moon, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useActivityLog } from "@/context/ActivityLogContext";
import { cn } from "@/lib/utils";

interface DayTimelineProps {
  dayUtc: string | null;
  dayLocal?: string | null;
}

type TimelineKind = "meal" | "activity" | "sleep" | "stress";

interface TimelineItem {
  id: string;
  label: string;
  description?: string;
  minutesOfDayUtc: number;
  kind: TimelineKind;
  timestampUtc: string;
}

const buildLogItems = (day: string, logs: ReturnType<typeof useActivityLog>["logs"]) => {
  console.log('[DayTimeline] buildLogItems called:', { day, totalLogs: logs.length });
  console.log('[DayTimeline] All log days:', logs.map(l => ({ id: l.id, day: l.day, title: l.title, timestamp: l.timestamp })));

  const filtered = logs.filter((log) => log.day === day);
  console.log('[DayTimeline] Filtered logs for day:', { day, filteredCount: filtered.length, filtered });

  return filtered.map((log) => ({
    id: log.id,
    label: log.title,
    description: log.note,
    minutesOfDayUtc: log.minutesOfDayUtc,
    kind: mapCategoryToKind(log.category as string),
    timestampUtc: log.timestamp,
  }));
};

const prepareTimelineItems = (day: string, logs: ReturnType<typeof useActivityLog>["logs"]) => {
  const items: TimelineItem[] = buildLogItems(day, logs);
  return items.sort((a, b) => a.minutesOfDayUtc - b.minutesOfDayUtc);
};

const formatTimestamp = (iso: string, locale: string, timeZone: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(iso));

const mapCategoryToKind = (category: string): TimelineKind => {
  switch (category) {
    case "food":
      return "meal";
    case "lifestyle":
      return "activity";
    case "medication":
      return "activity";
    case "sleep":
      return "sleep";
    case "stress":
      return "stress";
    default:
      return "activity";
  }
};

const KIND_CONFIG: Record<TimelineKind, { label: string; icon: LucideIcon; badgeClass: string }> = {
  meal: {
    label: "Meal",
    icon: UtensilsCrossed,
    badgeClass: "bg-amber-100 text-amber-900",
  },
  activity: {
    label: "Activity",
    icon: Dumbbell,
    badgeClass: "bg-emerald-100 text-emerald-900",
  },
  sleep: {
    label: "Sleep",
    icon: Moon,
    badgeClass: "bg-slate-900 text-white",
  },
  stress: {
    label: "Stress",
    icon: Brain,
    badgeClass: "bg-rose-100 text-rose-900",
  },
};

export const DayTimeline = ({ dayUtc, dayLocal }: DayTimelineProps) => {
  const { preferences } = useUserPreferences();
  const { logs } = useActivityLog();
  const timelineItems = useMemo(() => {
    if (!dayUtc) return [];
    return prepareTimelineItems(dayUtc, logs);
  }, [dayUtc, logs]);

  if (!dayUtc) {
    return (
      <Card className="mx-6 mt-6 p-6 rounded-3xl border-dashed border-border text-muted-foreground">
        Select any day on the calendar to review the meals, activities, sleep, or stress notes logged for that date.
      </Card>
    );
  }

  const displayDate = dayLocal
    ? new Date(`${dayLocal}T00:00:00`)
    : new Date(`${dayUtc}T00:00:00Z`);

  return (
    <Card className="mx-6 mt-6 rounded-3xl border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily view</p>
          <h2 className="text-2xl font-semibold">
            {new Intl.DateTimeFormat(preferences.locale, { dateStyle: "full", timeZone: dayLocal ? preferences.timezone : "UTC" }).format(
              displayDate,
            )}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {timelineItems.length ? `${timelineItems.length} logs recorded` : "No logs yet"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {(Object.keys(KIND_CONFIG) as TimelineKind[]).map((kind) => {
          const config = KIND_CONFIG[kind];
          const count = timelineItems.filter((item) => item.kind === kind).length;
          return (
            <div
              key={kind}
              className={cn(
                "rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm flex items-center justify-between",
                count === 0 && "opacity-50",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", config.badgeClass)}>
                  <config.icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-semibold">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{count ? `${count} log${count > 1 ? "s" : ""}` : "No logs"}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{count ? "Tracked" : "Pending"}</span>
            </div>
          );
        })}
      </div>

      {timelineItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          You haven’t logged anything for this day yet. Tap “Log” on the home screen to capture meals, movement, sleep, or stress notes.
        </div>
      ) : (
        <ol className="space-y-3">
          {timelineItems.map((item) => {
            const config = KIND_CONFIG[item.kind];
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-border/60 bg-background/80 p-4 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className={cn("mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl", config.badgeClass)}>
                    <config.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.label || config.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} · {formatTimestamp(item.timestampUtc, preferences.locale, preferences.timezone)}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground/90">{item.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.floor(item.minutesOfDayUtc / 60)
                    .toString()
                    .padStart(2, "0")}
                  :
                  {(item.minutesOfDayUtc % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
};
