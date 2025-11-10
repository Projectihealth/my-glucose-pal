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

export interface DaySummary {
  day: string;
  tir: number;
  avgGlucose: number;
  timeInRangeMinutes: number;
  totalMinutes: number;
  readings: number;
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

let cachedRawData: RawTrendPoint[] | null = null;
let rawDataPromise: Promise<RawTrendPoint[]> | null = null;

const fetchGlucoseDataset = async (): Promise<RawTrendPoint[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/glucose_trend.json`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to load trend data (${response.status})`);
  const payload = await response.json();
  return (Array.isArray(payload) ? payload : payload?.data?.rawData ?? []) as RawTrendPoint[];
};

const useGlucoseDayMap = (locale: string) => {
  const [rawData, setRawData] = useState<RawTrendPoint[]>(cachedRawData ?? []);
  const [loading, setLoading] = useState(!cachedRawData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (cachedRawData) {
      setRawData(cachedRawData);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const hydrate = async () => {
      try {
        setLoading(true);
        setError(null);
        rawDataPromise = rawDataPromise ?? fetchGlucoseDataset();
        const data = await rawDataPromise;
        if (cancelled) return;
        cachedRawData = data;
        setRawData(data);
      } catch (err) {
        if (cancelled) return;
        rawDataPromise = null;
        setError((err as Error).message);
        setRawData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void hydrate();

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

  return { dayMap, loading, error } as const;
};

export const useGlucoseTrend = (
  locale: string,
  timeZone: string,
  selectedDay?: string | null,
) => {
  const { dayMap, loading, error } = useGlucoseDayMap(locale);
  const [displayedPoints, setDisplayedPoints] = useState<GlucoseTrendPoint[]>([]);
  const [resolvedDay, setResolvedDay] = useState<string | null>(null);
  const [updateIntervalMs, setUpdateIntervalMs] = useState(DEFAULT_INTERVAL_MS);

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
    dayMap,
  };
};

const summarizeDay = (points: GlucoseTrendPoint[]) => {
  if (!points.length) {
    return {
      tir: 0,
      avgGlucose: 0,
      timeInRangeMinutes: 0,
      totalMinutes: 0,
      readings: 0,
    };
  }

  let totalMinutes = 0;
  let timeInRange = 0;
  let glucoseSum = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const delta = next
      ? Math.max(1, (next.timestamp - current.timestamp) / 60000)
      : UPDATE_INTERVAL_MINUTES;
    totalMinutes += delta;
    if (current.glucose >= 70 && current.glucose <= 140) {
      timeInRange += delta;
    }
    glucoseSum += current.glucose;
  }

  return {
    tir: totalMinutes ? (timeInRange / totalMinutes) * 100 : 0,
    avgGlucose: glucoseSum / points.length,
    timeInRangeMinutes: timeInRange,
    totalMinutes,
    readings: points.length,
  };
};

export const useGlucoseCalendarData = (locale: string) => {
  const { dayMap, loading, error } = useGlucoseDayMap(locale);

  const summaries = useMemo<Record<string, DaySummary>>(() => {
    const map: Record<string, DaySummary> = {};
    Object.entries(dayMap).forEach(([day, points]) => {
      const daily = summarizeDay(points);
      map[day] = {
        day,
        tir: daily.tir,
        avgGlucose: daily.avgGlucose,
        timeInRangeMinutes: daily.timeInRangeMinutes,
        totalMinutes: daily.totalMinutes,
        readings: daily.readings,
      };
    });
    return map;
  }, [dayMap]);

  const allDays = useMemo(() => Object.keys(dayMap).sort(), [dayMap]);

  return {
    summaries,
    allDays,
    loading,
    error,
  } as const;
};

export const useGlucoseDaySeries = (locale: string, day: string | null) => {
  const { dayMap, loading, error } = useGlucoseDayMap(locale);
  const series = day && dayMap[day] ? dayMap[day] : [];

  return {
    points: series,
    loading,
    error,
  } as const;
};
