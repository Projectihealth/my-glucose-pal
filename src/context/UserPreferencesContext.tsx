import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

const LANGUAGE_LOCALE_MAP = {
  English: "en-US",
  "Español": "es-ES",
  "中文": "zh-CN",
} as const;

type SupportedLanguage = keyof typeof LANGUAGE_LOCALE_MAP;

interface UserPreferences {
  timezone: string;
  language: SupportedLanguage;
  locale: string;
}

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (update: { timezone: string; language: SupportedLanguage }) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  timezone: "America/Los_Angeles",
  language: "English",
  locale: LANGUAGE_LOCALE_MAP.English,
};

const STORAGE_KEY = "userPreferences";

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

function normalisePreferences(raw: Partial<UserPreferences> | null): UserPreferences {
  if (!raw) return DEFAULT_PREFERENCES;
  const language = (raw.language && LANGUAGE_LOCALE_MAP[raw.language as SupportedLanguage]
    ? (raw.language as SupportedLanguage)
    : DEFAULT_PREFERENCES.language);
  const timezone = raw.timezone || DEFAULT_PREFERENCES.timezone;
  const locale = LANGUAGE_LOCALE_MAP[language];
  return { timezone, language, locale };
}

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserPreferences> | null;
        setPreferences(normalisePreferences(parsed));
      }
    } catch (error) {
      console.warn("Failed to load user preferences from storage", error);
    }
  }, []);

  const updatePreferences = ({ language, timezone }: { language: SupportedLanguage; timezone: string }) => {
    setPreferences(() => {
      const next = normalisePreferences({ language, timezone });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("Failed to persist user preferences", error);
      }
      return next;
    });
  };

  const value = useMemo<UserPreferencesContextValue>(
    () => ({ preferences, updatePreferences }),
    [preferences],
  );

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};

export type { SupportedLanguage };
export { LANGUAGE_LOCALE_MAP };
