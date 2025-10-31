import { useEffect, useRef, useState } from "react";

interface PatternRule {
  pattern_id: string;
  metrics?: Record<string, unknown>;
  evidence?: Record<string, unknown>;
}

export interface PatternOverlay {
  patternId: string;
  label: string;
  points: {
    timestamp: number;
    minutesOfDayUtc: number;
    median: number;
    label: string;
  }[];
  occurrences: number;
  highlight: boolean;
  color?: string;
}

const RULES_PATH = "pattern_rules.json";

const SHAPE_FILE_MAP: Record<string, string> = {
  dawn_phenomenon: "dawn_phenomenon_summary_time_of_day.csv",
  dual_peak: "dual_peak_summary_time_of_day.csv",
  nocturnal_hypoglycemia_moderate: "nocturnal_hypoglycemia_moderate_summary_time_of_day.csv",
  nocturnal_hypoglycemia_severe: "nocturnal_hypoglycemia_severe_summary_time_of_day.csv",
  overnight_compression_low: "overnight_compression_low_summary_time_of_day.csv",
  overnight_hyperglycemia: "overnight_hyperglycemia_summary_time_of_day.csv",
  somogyi_effect: "somogyi_effect_summary_time_of_day.csv",
};

const toTitle = (id: string) =>
  id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

interface ShapeTemplatePoint {
  minutes: number;
  median: number;
}

const parseCsv = (csvText: string): ShapeTemplatePoint[] => {
  const [headerLine, ...rows] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  const medianIndex = headers.indexOf("median");
  const minutesIndex = headers.indexOf("time_minutes");

  if (medianIndex === -1 || minutesIndex === -1) return [];

  return rows
    .map((line) => line.split(","))
    .filter((cols) => cols[medianIndex] && cols[minutesIndex])
    .map((cols) => ({
      minutes: Number(cols[minutesIndex]),
      median: Number(cols[medianIndex]),
    }))
    .filter((entry) => Number.isFinite(entry.minutes) && Number.isFinite(entry.median));
};

const COUNT_KEY_REGEX = /(day|night|occurrence|count|episode)/i;

const getOccurrenceCount = (pattern: PatternRule): number => {
  const metrics = pattern.metrics ?? {};
  let count = 0;

  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value !== "number") continue;
    if (COUNT_KEY_REGEX.test(key)) {
      count = Math.max(count, value);
    }
  }

  if (count === 0) {
    const evidence = pattern.evidence as Record<string, unknown> | undefined;
    const candidateLists = [
      evidence?.examples,
      evidence?.persistent_examples,
      evidence?.spike_examples,
    ];
    for (const candidate of candidateLists) {
      if (Array.isArray(candidate) && candidate.length) {
        count = Math.max(count, candidate.length);
      }
    }
  }

  return count || 1;
};

export const usePatternOverlays = (resolvedDay: string | null, locale: string) => {
  const [rules, setRules] = useState<Record<string, PatternRule[]>>({});
  const [overlays, setOverlays] = useState<PatternOverlay[]>([]);
  const shapeCache = useRef<Map<string, ShapeTemplatePoint[]>>(new Map());

  useEffect(() => {
    let cancelled = false;

    const loadRules = async () => {
      try {
        const response = await fetch(RULES_PATH, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load pattern rules (${response.status})`);
        const data = await response.json();
        if (!cancelled) setRules(data ?? {});
      } catch (err) {
        console.warn("Unable to load pattern rules", err);
        if (!cancelled) setRules({});
      }
    };

    void loadRules();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadOverlays = async () => {
      if (!resolvedDay) {
        setOverlays([]);
        return;
      }

      const patterns = rules[resolvedDay] ?? [];
      if (!patterns.length) {
        setOverlays([]);
        return;
      }

      const results: PatternOverlay[] = [];
      const dayStart = new Date(`${resolvedDay}T00:00:00Z`).getTime();
      const labelFormatter = new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
      });

      for (const pattern of patterns) {
        const occurrences = getOccurrenceCount(pattern);
        const shapeFile = SHAPE_FILE_MAP[pattern.pattern_id];

        let points: PatternOverlay["points"] = [];
        let highlight = false;

        if (shapeFile) {
          if (!shapeCache.current.has(shapeFile)) {
            try {
              const response = await fetch(`patternshapes/${shapeFile}`);
              if (!response.ok) throw new Error(`Failed to load pattern shape ${shapeFile}`);
              const csv = await response.text();
              const parsed = parseCsv(csv);
              shapeCache.current.set(shapeFile, parsed);
            } catch (err) {
              console.warn(`Unable to parse pattern shape for ${pattern.pattern_id}`, err);
              shapeCache.current.set(shapeFile, []);
            }
          }

          const template = shapeCache.current.get(shapeFile) ?? [];
          if (template.length) {
            highlight = occurrences > 0;
            points = template.map(({ minutes, median }) => {
              const timestamp = dayStart + minutes * 60 * 1000;
              return {
                timestamp,
                minutesOfDayUtc: minutes,
                median,
                label: labelFormatter.format(new Date(timestamp)),
              };
            });
          }
        }

        results.push({
          patternId: pattern.pattern_id,
          label: toTitle(pattern.pattern_id),
          points,
          occurrences,
          highlight,
          color: highlight ? "#ef4444" : undefined,
        });
      }

      if (!cancelled) {
        setOverlays(results);
      }
    };

    void loadOverlays();

    return () => {
      cancelled = true;
    };
  }, [rules, resolvedDay, locale]);

  return overlays;
};
