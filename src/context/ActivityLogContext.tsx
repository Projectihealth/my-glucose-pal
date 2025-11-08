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

interface ActivityLogProviderProps {
  children: ReactNode;
}

export const ActivityLogProvider = ({ children }: ActivityLogProviderProps) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
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
        setLogs([]);
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
          setLogs(payload.map(mapApiLogToEntry));
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Unable to load activity logs", error);
          setLogs([]);
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

  const addLog = useCallback(
    async (entry: ActivityLogInput): Promise<ActivityLogEntry | null> => {
      if (!API_BASE) {
        console.warn("Activity log API base URL is not configured");
        return null;
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
      setLogs((prev) => [created, ...prev]);
      return created;
    },
    [userId],
  );

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
