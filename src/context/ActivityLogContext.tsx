import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ActivityLogCategory = "food" | "lifestyle" | "medication";

export interface ActivityLogInput {
  title: string;
  category: ActivityLogCategory;
  note?: string;
  timestamp: string; // ISO timestamp
  medicationName?: string;
  dose?: string;
}

export interface ActivityLogEntry extends ActivityLogInput {
  id: string;
  day: string; // YYYY-MM-DD in UTC
  minutesOfDayUtc: number;
}

interface ActivityLogContextValue {
  logs: ActivityLogEntry[];
  addLog: (entry: ActivityLogInput) => void;
}

const ActivityLogContext = createContext<ActivityLogContextValue | undefined>(undefined);

const STORAGE_KEY = "activity-log-entries";

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
      day: now.toISOString().slice(0, 10),
      minutes: now.getUTCHours() * 60 + now.getUTCMinutes(),
    };
  }

  return {
    day: date.toISOString().slice(0, 10),
    minutes: date.getUTCHours() * 60 + date.getUTCMinutes(),
  };
};

const loadInitialLogs = (): ActivityLogEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ActivityLogEntry[];
  } catch (error) {
    console.warn("Unable to parse stored activity logs", error);
    return [];
  }
};

interface ActivityLogProviderProps {
  children: ReactNode;
}

export const ActivityLogProvider = ({ children }: ActivityLogProviderProps) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>(() => loadInitialLogs());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addLog = useCallback((entry: ActivityLogInput) => {
    const { day, minutes } = parseTimestamp(entry.timestamp);
    setLogs((prev) => [
      {
        ...entry,
        id: generateId(),
        day,
        minutesOfDayUtc: minutes,
        medicationName: entry.category === "medication" ? entry.medicationName : undefined,
        dose: entry.category === "medication" ? entry.dose : undefined,
      },
      ...prev,
    ]);
  }, []);

  const value = useMemo(() => ({ logs, addLog }), [logs, addLog]);

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error("useActivityLog must be used within an ActivityLogProvider");
  }
  return context;
};
