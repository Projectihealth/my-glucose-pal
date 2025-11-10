import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ActivityLogCategory = "food" | "lifestyle" | "medication";

export interface ActivityLogInput {
  title: string;
  category: ActivityLogCategory;
  note?: string;
  timestamp: string; // ISO timestamp (UTC)
  medicationName?: string;
  dose?: string;
}

export interface ActivityLogEntry extends ActivityLogInput {
  id: string;
  day: string; // YYYY-MM-DD in UTC
  minutesOfDayUtc: number;
  createdAt?: string;
}

interface ActivityLogContextValue {
  logs: ActivityLogEntry[];
  addLog: (entry: ActivityLogInput) => Promise<ActivityLogEntry | null>;
  isLoading: boolean;
}

const ActivityLogContext = createContext<ActivityLogContextValue | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");
const OFFLINE_STORAGE_KEY = "activity-log-offline";

const getCurrentUserId = () => {
  if (typeof window === "undefined") return "user_001";
  try {
    return window.localStorage.getItem("currentUserId") ?? "user_001";
  } catch (error) {
    console.warn("Unable to read current user id from storage", error);
    return "user_001";
  }
};

type ActivityLogApiRow = {
  id: number;
  user_id: string;
  category: ActivityLogCategory;
  title: string;
  note?: string | null;
  timestamp_utc: string;
  day_utc: string;
  minutes_of_day_utc: number;
  medication_name?: string | null;
  dose?: string | null;
  created_at?: string | null;
};

const mapApiLogToEntry = (raw: ActivityLogApiRow): ActivityLogEntry => ({
  id: String(raw.id),
  title: raw.title,
  category: raw.category,
  note: raw.note ?? undefined,
  timestamp: raw.timestamp_utc,
  day: raw.day_utc,
  minutesOfDayUtc: Number(raw.minutes_of_day_utc ?? 0),
  medicationName: raw.medication_name ?? undefined,
  dose: raw.dose ?? undefined,
  createdAt: raw.created_at ?? undefined,
});

const buildLogsEndpoint = (userId: string) => {
  const params = new URLSearchParams({ limit: "200" });
  return `${API_BASE}/api/activity-logs/${encodeURIComponent(userId)}?${params.toString()}`;
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const parseTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return {
      iso: now.toISOString(),
      day: now.toISOString().slice(0, 10),
      minutes: now.getUTCHours() * 60 + now.getUTCMinutes(),
    };
  }

  return {
    iso: date.toISOString(),
    day: date.toISOString().slice(0, 10),
    minutes: date.getUTCHours() * 60 + date.getUTCMinutes(),
  };
};

const loadOfflineLogs = (): ActivityLogEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ActivityLogEntry[];
  } catch (error) {
    console.warn("Unable to parse offline activity logs", error);
    return [];
  }
};

const persistOfflineLogs = (entries: ActivityLogEntry[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Unable to persist offline activity logs", error);
  }
};

interface ActivityLogProviderProps {
  children: ReactNode;
}

export const ActivityLogProvider = ({ children }: ActivityLogProviderProps) => {
  const [remoteLogs, setRemoteLogs] = useState<ActivityLogEntry[]>([]);
  const [offlineLogs, setOfflineLogs] = useState<ActivityLogEntry[]>(() => loadOfflineLogs());
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(() => getCurrentUserId());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "currentUserId") {
        setUserId(event.newValue ?? "user_001");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      if (!API_BASE) {
        setRemoteLogs([]);
        return;
      }

      setIsLoading(true);
      try {
        const endpoint = buildLogsEndpoint(userId);
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load activity logs (${response.status})`);
        }
        const payload = (await response.json()) as ActivityLogApiRow[];
        if (!cancelled) {
          setRemoteLogs(payload.map(mapApiLogToEntry));
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Unable to load activity logs", error);
          setRemoteLogs([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (typeof window !== "undefined") {
      void loadLogs();
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === OFFLINE_STORAGE_KEY) {
        setOfflineLogs(loadOfflineLogs());
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const addOfflineLog = useCallback((entry: ActivityLogInput): ActivityLogEntry => {
    const { iso, day, minutes } = parseTimestamp(entry.timestamp);
    const offlineEntry: ActivityLogEntry = {
      ...entry,
      id: generateId(),
      timestamp: iso,
      day,
      minutesOfDayUtc: minutes,
      medicationName: entry.category === "medication" ? entry.medicationName : undefined,
      dose: entry.category === "medication" ? entry.dose : undefined,
      createdAt: new Date().toISOString(),
    };
    setOfflineLogs((prev) => {
      const next = [offlineEntry, ...prev];
      persistOfflineLogs(next);
      return next;
    });
    return offlineEntry;
  }, []);

  const addLog = useCallback(
    async (entry: ActivityLogInput): Promise<ActivityLogEntry | null> => {
      if (!API_BASE) {
        console.warn("Activity log API base URL is not configured. Saving locally.");
        return addOfflineLog(entry);
      }

      const payload = {
        userId,
        title: entry.title,
        category: entry.category,
        note: entry.note ?? null,
        timestampUtc: entry.timestamp,
        medicationName: entry.category === "medication" ? entry.medicationName ?? null : null,
        dose: entry.category === "medication" ? entry.dose ?? null : null,
      };

      try {
        const response = await fetch(`${API_BASE}/api/activity-logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to create activity log");
        }

        const created = mapApiLogToEntry((await response.json()) as ActivityLogApiRow);
        setRemoteLogs((prev) => [created, ...prev]);
        return created;
      } catch (error) {
        console.warn("Falling back to offline log entry", error);
        return addOfflineLog(entry);
      }
    },
    [userId, addOfflineLog],
  );

  const logs = useMemo(() => {
    const merged = [...offlineLogs, ...remoteLogs];
    merged.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return merged;
  }, [offlineLogs, remoteLogs]);

  const value = useMemo(
    () => ({
      logs,
      addLog,
      isLoading,
    }),
    [logs, addLog, isLoading],
  );

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error("useActivityLog must be used within an ActivityLogProvider");
  }
  return context;
};
