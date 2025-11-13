import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useGlucoseCalendarData, DaySummary } from "@/hooks/useGlucoseTrend";
import { useActivityLog } from "@/context/ActivityLogContext";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface MonthlyCalendarProps {
  selectedDay: string | null;
  onSelectDay: (localDay: string) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toIsoDay = (year: number, month: number, day: number) => {
  return `${year.toString().padStart(4, "0")}-${(month + 1).toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
};

const parseDay = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const shiftMonth = (date: Date, delta: number) => {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
  return next;
};

const getDefaultMonth = (selectedDay: string | null, allDays: string[]) => {
  if (selectedDay) return parseDay(selectedDay);
  if (allDays.length) return parseDay(allDays[allDays.length - 1]);
  return new Date();
};

const getAchievement = (summary: DaySummary | undefined, meals: number, activityMinutes: number) => {
  if (!summary) return false;
  return summary.tir >= 80 && (meals >= 3 || activityMinutes >= 45);
};

export const MonthlyCalendar = ({ selectedDay, onSelectDay }: MonthlyCalendarProps) => {
  const { preferences } = useUserPreferences();
  const { summaries, allDays, loading } = useGlucoseCalendarData(preferences.locale);
  const { logs } = useActivityLog();

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: preferences.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [preferences.timezone],
  );

  const allLocalDays = useMemo(() => {
    const set = new Set<string>();
    allDays.forEach((day) => {
      set.add(dayFormatter.format(new Date(`${day}T00:00:00Z`)));
    });
    return Array.from(set).sort();
  }, [allDays, dayFormatter]);

  const summaryByLocalDay = useMemo(() => {
    const map: Record<string, { summary: DaySummary; utcDay: string }> = {};
    Object.entries(summaries).forEach(([utcDay, summary]) => {
      const localDay = dayFormatter.format(new Date(`${utcDay}T00:00:00Z`));
      map[localDay] = { summary, utcDay };
    });
    return map;
  }, [summaries, dayFormatter]);

  const [viewDate, setViewDate] = useState(() => getDefaultMonth(selectedDay, allLocalDays));

  useEffect(() => {
    if (selectedDay) {
      setViewDate(parseDay(selectedDay));
    }
  }, [selectedDay]);

  const getLocalDayFromTimestamp = useCallback(
    (timestamp: string) => dayFormatter.format(new Date(timestamp)),
    [dayFormatter],
  );

  const mealCounts = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.category === "food") {
        const key = getLocalDayFromTimestamp(log.timestamp);
        map[key] = (map[key] ?? 0) + 1;
      }
    });
    return map;
  }, [logs, getLocalDayFromTimestamp]);

  const activityMinutes = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.category === "lifestyle") {
        const key = getLocalDayFromTimestamp(log.timestamp);
        map[key] = (map[key] ?? 0) + 30; // assume 30 minutes per lifestyle entry
      }
    });
    return map;
  }, [logs, getLocalDayFromTimestamp]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dateNumber = index - firstWeekday + 1;
      if (dateNumber < 1 || dateNumber > daysInMonth) {
        return { key: `placeholder-${index}` };
      }
      const iso = toIsoDay(year, month, dateNumber);
      const summaryBundle = summaryByLocalDay[iso];
      const summary = summaryBundle?.summary;
      const meals = mealCounts[iso] ?? 0;
      const activity = activityMinutes[iso] ?? 0;
      const dotClass = cn(
        "w-2 h-2 rounded-full",
        !summary && "bg-border",
        summary && summary.tir >= 70 && "bg-emerald-500",
        summary && summary.tir >= 50 && summary.tir < 70 && "bg-amber-400",
        summary && summary.tir < 50 && "bg-rose-500",
      );
      return {
        key: iso,
        iso,
        label: dateNumber,
        summary,
        meals,
        activity,
        dotClass,
      };
    });
  }, [viewDate, summaryByLocalDay, mealCounts, activityMinutes]);

  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(preferences.locale, {
        month: "long",
        year: "numeric",
      }),
    [preferences.locale],
  );

  return (
    <Card className="mx-6 mt-6 p-5 rounded-3xl border-border/60">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly view</p>
          <h2 className="text-2xl font-semibold">{monthFormatter.format(viewDate)}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setViewDate((prev) => shiftMonth(prev, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setViewDate((prev) => shiftMonth(prev, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="font-medium">
            {label}
          </span>
        ))}
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            if (!cell.iso) {
              return <div key={cell.key} className="h-16" />;
            }

            const isSelected = selectedDay === cell.iso;
            const showStar = getAchievement(cell.summary, cell.meals, cell.activity);
            const title = cell.summary ? `${cell.summary.tir.toFixed(0)}% in range` : "No CGM data";

            const content = (
              <button
                type="button"
                onClick={() => onSelectDay(cell.iso!)}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center rounded-2xl border text-sm",
                    isSelected ? "border-primary/60 bg-primary/5" : "border-border/60 bg-muted/40",
                    cell.summary ? "hover:border-primary/50" : "opacity-60",
                  )}
              >
                <span className="text-sm font-semibold">{cell.label}</span>
                <span className="mt-1 flex items-center gap-1">
                  <span className={cell.dotClass} />
                  {showStar && <Star className="w-3 h-3 text-primary" />}
                </span>
                {isSelected && (
                  <span className="absolute inset-x-2 bottom-1 rounded-full bg-primary/10 text-[10px] text-primary">
                    Daily timeline
                  </span>
                )}
              </button>
            );

            if (loading) {
              return (
                <div key={cell.iso} className="animate-pulse rounded-2xl bg-muted/30 h-16" />
              );
            }

            return (
              <Tooltip key={cell.iso}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent className="text-xs">
                  <p className="font-medium">{title}</p>
                  <p>Avg: {cell.summary ? `${cell.summary.avgGlucose.toFixed(0)} mg/dL` : "--"}</p>
                  <p>Meals logged: {cell.meals}</p>
                  <p>Activity minutes: {cell.activity}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Good day (&gt;70% TIR)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Moderate (50-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Challenging (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-3 h-3 text-primary" />
          <span>Achievement day</span>
        </div>
      </div>
    </Card>
  );
};
