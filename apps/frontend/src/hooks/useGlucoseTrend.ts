import { useEffect, useMemo, useState } from "react";

export interface GlucoseTrendPoint {
  timestamp: number; // absolute UTC timestamp in ms
  minutesOfDayUtc: number; // 0-1439
  label: string; // formatted time label
  glucose: number;
}

interface RawTrendPoint {
  utc: string;
  value: number | null;
}

const UPDATE_INTERVAL_MINUTES = 5;
const DEFAULT_INTERVAL_MS = UPDATE_INTERVAL_MINUTES * 60 * 1000;
const INITIAL_DAY_COUNT = 288; // number of readings shown immediately per day
const DEFAULT_LOCALE_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

const DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const convertReading = (reading: RawTrendPoint, locale: string) => {
  const date = new Date(reading.utc);
  if (Number.isNaN(date.getTime()) || reading.value === null) return null;

  const dayKey = DAY_FORMATTER.format(date);
  const minutesOfDayUtc = date.getUTCHours() * 60 + date.getUTCMinutes();
  const labelFormatter = new Intl.DateTimeFormat(locale, DEFAULT_LOCALE_LABEL_FORMAT);

  return {
    dayKey,
    point: {
      timestamp: date.getTime(),
      minutesOfDayUtc,
      label: labelFormatter.format(date),
      glucose: reading.value,
    } as GlucoseTrendPoint,
  };
};

export const useGlucoseTrend = (
  locale: string,
  timeZone: string,
  selectedDay?: string | null,
) => {
  const [rawData, setRawData] = useState<RawTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedPoints, setDisplayedPoints] = useState<GlucoseTrendPoint[]>([]);
  const [resolvedDay, setResolvedDay] = useState<string | null>(null);
  const [updateIntervalMs, setUpdateIntervalMs] = useState(DEFAULT_INTERVAL_MS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.BASE_URL}data/glucose_trend.json`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Failed to load trend data (${response.status})`);
        const payload = await response.json();
        const dataArray = Array.isArray(payload)
          ? payload
          : payload?.data?.rawData ?? [];
        if (!cancelled) setRawData(dataArray as RawTrendPoint[]);
      } catch (err) {
        if (cancelled) return;
        console.warn("Unable to load glucose trend data", err);
        setError((err as Error).message);
        setRawData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const dayMap = useMemo(() => {
    const map: Record<string, GlucoseTrendPoint[]> = {};

    rawData
      .map((reading) => convertReading(reading, locale))
      .filter((entry): entry is { dayKey: string; point: GlucoseTrendPoint } => entry !== null)
      .forEach(({ dayKey, point }) => {
        if (!map[dayKey]) map[dayKey] = [];
        map[dayKey].push(point);
      });

    Object.keys(map).forEach((day) => {
      map[day].sort((a, b) => a.timestamp - b.timestamp);
    });

    return map;
  }, [rawData, locale]);

  const availableDays = useMemo(() => {
    const days = Object.keys(dayMap).sort();
    if (!days.length) return days;

    const desiredStart = "2025-11-09";
    const desiredEnd = "2025-11-19";
    const targetedRange = days.filter((day) => day >= desiredStart && day <= desiredEnd);
    if (targetedRange.length > 0) {
      return targetedRange;
    }

    if (days.length <= 10) return days;
    return days.slice(days.length - 10);
  }, [dayMap]);

  useEffect(() => {
    if (!availableDays.length) {
      setResolvedDay(null);
      setDisplayedPoints([]);
      return;
    }

    const target = selectedDay && availableDays.includes(selectedDay)
      ? selectedDay
      : availableDays[availableDays.length - 1];

    setResolvedDay(target);
  }, [availableDays, selectedDay]);

  useEffect(() => {
    if (!resolvedDay) {
      setDisplayedPoints([]);
      return;
    }

    const fullSeries = dayMap[resolvedDay] ?? [];
    if (!fullSeries.length) {
      setDisplayedPoints([]);
      return;
    }

    const inferredInterval = fullSeries.length > 1
      ? Math.max(1, fullSeries[1].timestamp - fullSeries[0].timestamp)
      : DEFAULT_INTERVAL_MS;
    setUpdateIntervalMs(inferredInterval);

    const initialCount = Math.min(INITIAL_DAY_COUNT, fullSeries.length);
    setDisplayedPoints(fullSeries.slice(0, initialCount));

    if (fullSeries.length <= initialCount) return;

    let index = initialCount;
    const timer = window.setInterval(() => {
      setDisplayedPoints((prev) => {
        if (index >= fullSeries.length) {
          window.clearInterval(timer);
          return prev;
        }
        const nextPoint = fullSeries[index];
        index += 1;
        return [...prev, nextPoint];
      });
    }, inferredInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [dayMap, resolvedDay]);

  const latest = displayedPoints.at(-1) ?? null;

  return {
    points: displayedPoints,
    loading,
    error,
    latest,
    availableDays,
    resolvedDay,
    updateIntervalMinutes: updateIntervalMs / 60000,
  };
};
