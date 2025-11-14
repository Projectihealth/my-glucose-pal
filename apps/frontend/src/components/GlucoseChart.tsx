import { useEffect, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, ReferenceArea, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useGlucoseTrend } from "@/hooks/useGlucoseTrend";
import { usePatternOverlays } from "@/hooks/usePatternOverlays";
import { PATTERN_ACTIONS } from "@/data/patternActions";
import { useActivityLog } from "@/context/ActivityLogContext";

const LOW_THRESHOLD = 70;
const HIGH_THRESHOLD = 170;

const COPY = {
  English: {
    title: "Daily CGM Graph",
    currentLabel: "Latest",
    legendActual: "Actual",
    lowLabel: "Below range",
    highLabel: "Above range",
    loading: "Loading CGM data…",
  },
  "Español": {
    title: "Cronología de glucosa",
    subtitle: "Reproducción de 10 días alineada a UTC",
    currentLabel: "Último",
    legendActual: "Actual",
    lowLabel: "Por debajo",
    highLabel: "Por encima",
    loading: "Cargando datos CGM…",
  },
  "中文": {
    title: "血糖时间线",
    subtitle: "以 UTC 对齐的 10 天 CGM 播放",
    currentLabel: "最新",
    legendActual: "实际值",
    lowLabel: "低于范围",
    highLabel: "高于范围",
    loading: "正在加载 CGM 数据…",
  },
} as const;

const formatMinutesFactory = (locale: string) => (minutes: number) => {
  const clamped = Math.max(0, Math.min(1439, Math.round(minutes)));
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  const date = new Date(Date.UTC(1970, 0, 1, hour, minute));
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

interface GlucoseChartProps {
  selectedDay: string | null;
  onDayChange: (day: string) => void;
}

export const GlucoseChart = ({ selectedDay, onDayChange }: GlucoseChartProps) => {
  const { preferences } = useUserPreferences();
  const copy = COPY[preferences.language] ?? COPY.English;
  const {
    points: chartData,
    loading: trendLoading,
    latest,
    availableDays,
    resolvedDay,
  } = useGlucoseTrend(preferences.locale, preferences.timezone, selectedDay);
  const overlays = usePatternOverlays(resolvedDay, preferences.locale);
  const { logs } = useActivityLog();

  useEffect(() => {
    if (!resolvedDay) return;

    if (!selectedDay) {
      onDayChange(resolvedDay);
      return;
    }

    if (selectedDay !== resolvedDay && !availableDays.includes(selectedDay)) {
      onDayChange(resolvedDay);
    }
  }, [resolvedDay, selectedDay, availableDays, onDayChange]);

  const isLoading = trendLoading || chartData.length === 0;
  const latestValue = latest?.glucose ?? 0;
  const latestLabel = latest?.label ?? "--";
  const formatMinutes = useMemo(() => formatMinutesFactory(preferences.locale), [preferences.locale]);
  const ticks = useMemo(() => [0, 240, 480, 720, 960, 1200, 1439], []);

  const currentDayIndex = resolvedDay ? availableDays.indexOf(resolvedDay) : -1;
  const displayDate = resolvedDay
    ? new Intl.DateTimeFormat(preferences.locale, {
        timeZone: "UTC",
        dateStyle: "medium",
      }).format(new Date(`${resolvedDay}T00:00:00Z`))
    : "";
  const overlayColors = useMemo(() => ["#ef4444", "#22c55e", "#6366f1", "#f97316", "#14b8a6"], []);
  const patternRecommendations = useMemo(() => {
    const seen = new Set<string>();
    return overlays.reduce<Array<{ patternId: string; label: string; actions: string[] }>>((acc, overlay) => {
      if (seen.has(overlay.patternId)) return acc;
      seen.add(overlay.patternId);
      const actions = PATTERN_ACTIONS[overlay.patternId];
      if (!actions || actions.length === 0) return acc;
      acc.push({
        patternId: overlay.patternId,
        label: overlay.label,
        actions,
      });
      return acc;
    }, []);
  }, [overlays]);
  const hasRecommendations = patternRecommendations.length > 0;
  const forecastNote = copy.forecastNote ?? "We’ll surface tailored guidance once new insights are available.";
  const activityDots = useMemo(() => {
    if (!resolvedDay || chartData.length === 0) return [];

    // Filter logs by local day to match calendar behavior
    // Convert resolvedDay (UTC) to local day for comparison
    const resolvedLocalDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: preferences.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(`${resolvedDay}T00:00:00Z`));

    const dayLogs = logs.filter((log) => {
      // Convert log timestamp to local day
      const logDate = new Date(log.timestamp);
      const localDay = new Intl.DateTimeFormat("en-CA", {
        timeZone: preferences.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(logDate);
      return localDay === resolvedLocalDay;
    });

    if (!dayLogs.length) return [];

    const categoryColors: Record<string, string> = {
      food: "#f59e0b", // amber for food/meals
      lifestyle: "#10b981", // emerald for lifestyle/activity
      medication: "#8b5cf6", // purple for medication
      sleep: "#475569", // slate for sleep
      stress: "#ef4444", // rose for stress
    };

    return dayLogs.map((log) => {
      let closest = chartData[0];
      let minDelta = Math.abs(chartData[0].minutesOfDayUtc - log.minutesOfDayUtc);
      for (let i = 1; i < chartData.length; i += 1) {
        const point = chartData[i];
        const delta = Math.abs(point.minutesOfDayUtc - log.minutesOfDayUtc);
        if (delta < minDelta) {
          minDelta = delta;
          closest = point;
        }
      }

      return {
        ...log,
        minutesOfDayUtc: log.minutesOfDayUtc,
        glucose: closest?.glucose ?? latestValue,
        displayTitle: log.title,
        displayNote: log.note,
        color: categoryColors[log.category] || "#6366f1",
        source: "activity" as const,
      };
    });
  }, [resolvedDay, chartData, logs, latestValue, preferences.timezone]);

  return (
    <section className="px-6 py-8 bg-white">
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{copy.title}</h2>
          {copy.subtitle && <p className="text-sm text-muted-foreground">{copy.subtitle}</p>}
          {availableDays.length > 1 && (
            <div className="mt-2 flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  currentDayIndex > 0 ? onDayChange(availableDays[currentDayIndex - 1]) : undefined
                }
                disabled={currentDayIndex <= 0}
              >
                Previous day
              </Button>
              <span className="font-medium text-foreground">{displayDate}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  currentDayIndex >= 0 && currentDayIndex < availableDays.length - 1
                    ? onDayChange(availableDays[currentDayIndex + 1])
                    : undefined
                }
                disabled={currentDayIndex === -1 || currentDayIndex >= availableDays.length - 1}
              >
                Next day
              </Button>
            </div>
          )}
        </div>

        <Card className="p-5 rounded-3xl border-border/60 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{copy.currentLabel}</p>
              <p className="text-2xl font-semibold">{latestValue.toFixed(1)} mg/dL</p>
              <p className="text-xs text-muted-foreground">{latestLabel}</p>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                {copy.legendActual}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              {copy.loading}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
                <XAxis
                  dataKey="minutesOfDayUtc"
                  type="number"
                  domain={[0, 1439]}
                  ticks={ticks}
                  tickFormatter={formatMinutes}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 350]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(value) => `${Math.round(value)} mg/dL`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    maxWidth: "240px",
                  }}
                  formatter={(value: number, _name, props) => {
                    const payload = props?.payload as (typeof chartData)[number] & {
                      displayTitle?: string;
                      displayNote?: string;
                      source?: string;
                      category?: string;
                      dose?: string;
                      medicationName?: string;
                      mealType?: string;
                    };

                    if (payload?.source === "activity") {
                      const headline = payload.displayTitle ?? "Logged activity";
                      const details: string[] = [];

                      if (payload.category === "food" && payload.mealType) {
                        details.push(`${payload.mealType.charAt(0).toUpperCase() + payload.mealType.slice(1)}`);
                      }

                      if (payload.category === "medication") {
                        if (payload.medicationName) {
                          details.push(payload.medicationName);
                        }
                        if (payload.dose) {
                          details.push(payload.dose);
                        }
                      }

                      if (payload.displayNote) {
                        details.push(payload.displayNote);
                      }

                      const subtitle = details.length ? details.join(" • ") : "Logged activity";
                      return [subtitle, headline];
                    }

                    const numericValue = typeof value === "number" ? value : Number(value);
                    return [`${numericValue.toFixed(1)} mg/dL`, copy.title];
                  }}
                  labelFormatter={(val, payload) => {
                    const first = payload?.[0]?.payload as (typeof chartData)[number] & {
                      displayTitle?: string;
                      source?: string;
                      category?: string;
                    };
                    const base = formatMinutes(Number(val));
                    if (first?.source === "activity") {
                      const labelParts = [base];
                      if (first.category) {
                        const categoryLabels: Record<string, string> = {
                          food: "Meal log",
                          lifestyle: "Activity log",
                          medication: "Medication log",
                          sleep: "Sleep log",
                          stress: "Stress log",
                        };
                        const categoryLabel = categoryLabels[first.category] || "Activity log";
                        labelParts.push(categoryLabel);
                      }
                      if (first.displayTitle) {
                        labelParts.push(first.displayTitle);
                      }
                      return labelParts.join(" • ");
                    }
                    return first?.label ?? base;
                  }}
                />
                <ReferenceArea y1={0} y2={LOW_THRESHOLD} fill="hsl(var(--destructive))" fillOpacity={0.12} />
                <ReferenceArea y1={HIGH_THRESHOLD} y2={350} fill="hsl(var(--accent))" fillOpacity={0.12} />
                <Area
                  type="monotone"
                  dataKey="glucose"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#colorGlucose)"
                  isAnimationActive={false}
                />
                {overlays
                  .filter((overlay) => overlay.highlight && overlay.points.length > 0)
                  .map((overlay, index) => (
                    <Line
                      key={`${overlay.patternId}-median`}
                      data={overlay.points}
                      dataKey="median"
                      type="monotone"
                      stroke={overlay.color ?? overlayColors[index % overlayColors.length]}
                      strokeWidth={2.5}
                      strokeDasharray="4 0"
                      dot={false}
                      isAnimationActive={false}
                      name={`${overlay.label} projection`}
                    />
                  ))}
                {activityDots.length > 0 && (
                  <Scatter
                    data={activityDots}
                    dataKey="glucose"
                    name="Logged activity"
                    fill="#8884d8"
                    shape="circle"
                    isAnimationActive={false}
                  >
                    {activityDots.map((dot) => (
                      <Cell
                        key={dot.id}
                        fill={dot.color}
                        stroke="#fff"
                        strokeWidth={2}
                        r={6}
                      />
                    ))}
                  </Scatter>
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div className="mt-2 text-xs text-muted-foreground space-y-2">
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-2 rounded-sm bg-[hsla(var(--destructive))] opacity-30" />
                {copy.lowLabel} (&lt; {LOW_THRESHOLD} mg/dL)
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-2 rounded-sm bg-[hsla(var(--accent))] opacity-30" />
                {copy.highLabel} (&gt; {HIGH_THRESHOLD} mg/dL)
              </div>
            </div>

            {activityDots.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-border/40">
                <span className="font-medium text-foreground/70">Activity logs:</span>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                  <span>Meal</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
                  <span>Activity</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
                  <span>Medication</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#475569" }} />
                  <span>Sleep</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                  <span>Stress</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-primary/5 text-primary flex items-start gap-3">
            <span className="text-base">🔮</span>
            <div className="space-y-3">
              {hasRecommendations ? (
                <div className="space-y-3">
                  <div className="space-y-4 text-sm text-foreground/80">
                    {patternRecommendations.map(({ patternId, label, actions }) => (
                      <div key={patternId} className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                        <ul className="space-y-1.5">
                          {actions.map((action) => (
                            <li key={action} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/80">{forecastNote}</p>
              )}
            </div>
          </div>
        </Card>

        {overlays.length > 0 && (
          <Card className="p-4 rounded-3xl border-border/60 text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground text-sm">Detected Patterns</p>
            <ul className="space-y-1">
              {overlays.map((overlay, index) => (
                <li key={overlay.patternId} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-4 rounded-full"
                    style={{ backgroundColor: overlayColors[index % overlayColors.length] }}
                  />
                  <span>{overlay.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </section>
  );
};
