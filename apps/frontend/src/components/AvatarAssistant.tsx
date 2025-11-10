import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserPreferences } from "@/context/UserPreferencesContext";

interface UserData {
  userId: string;
  name: string;
  healthGoal?: string;
  conditions?: string;
  device?: string;
  currentGlucose?: number;
  glucoseStatus?: string;
  avg24h?: number;
  avg7d?: number;
  minGlucose?: number;
  maxGlucose?: number;
  timeInRange24h?: number;
  timeInRange7d?: number;
  readingCount24h?: number;
  recentReadings: Array<{ timestamp: string; glucose: number; status: string }>;
  patterns: Array<{ pattern: string; severity: string; confidence: number; description: string }>;
  actions: Array<{ title: string; detail: string; category: string; priority: number }>;
}

const backendUrl = (import.meta.env.VITE_CGM_BUTLER_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const ASSISTANT_COPY = {
  English: {
    badge: "Video concierge",
    title: "Talk with Olivia",
    subtitle: "Discuss your day and ask questions about your glucose levels with Olivia.",
    preparing: "Preparing Olivia...",
    preparingSubtitle: "Fetching your personalized context",
    errorTitle: "We couldn’t reach Olivia",
    errorMessage: "Something went wrong. Please try again once the connection stabilises.",
    retry: "Try again",
    statusLabel: "Glucose",
  },
  "Español": {
    badge: "Conserje de video",
    title: "Habla con Olivia",
    subtitle: "Comparte tu día y pregúntale a Olivia sobre tus niveles de glucosa.",
    preparing: "Preparando a Olivia...",
    preparingSubtitle: "Obteniendo tu contexto personalizado",
    errorTitle: "No pudimos contactar a Olivia",
    errorMessage: "Algo salió mal. Intenta nuevamente cuando la conexión sea estable.",
    retry: "Reintentar",
    statusLabel: "Glucosa",
  },
  "中文": {
    badge: "视频助手",
    title: "与 Olivia 对话",
    subtitle: "分享你的一天，向 Olivia 咨询血糖相关问题。",
    preparing: "正在呼叫 Olivia...",
    preparingSubtitle: "加载你的个性化上下文",
    errorTitle: "暂时无法连接 Olivia",
    errorMessage: "连接出现问题，请稍后再试。",
    retry: "再试一次",
    statusLabel: "血糖",
  },
} as const;

const buildConversationalContext = (data: UserData): string => {
  const patterns = data.patterns.length
    ? data.patterns
        .map(
          (pattern) =>
            `- ${pattern.pattern} (${pattern.severity}, ${Math.round(pattern.confidence * 100)}% confidence): ${pattern.description}`,
        )
        .join("\n")
    : "No significant patterns detected";

  const readings = data.recentReadings.length
    ? data.recentReadings
        .slice(0, 10)
        .map((reading) => `  ${reading.timestamp}: ${reading.glucose} mg/dL (${reading.status})`)
        .join("\n")
    : "No recent readings available";

  const actions = data.actions.length
    ? data.actions
        .slice(0, 5)
        .map((action) => `- [${action.category}] ${action.title}: ${action.detail} (Priority: ${action.priority})`)
        .join("\n")
    : "No specific recommendations at this time";

  const status = data.glucoseStatus ?? "Unknown";

  return `
╔════════════════════════════════════════════════════════════════╗
║                    USER PROFILE & HEALTH CONTEXT               ║
╚════════════════════════════════════════════════════════════════╝

👤 PERSONAL INFORMATION:
- Name: ${data.name}
- User ID: ${data.userId}
- Health Goal: ${data.healthGoal ?? "Not specified"}
- Conditions: ${data.conditions ?? "Not specified"}
- CGM Device: ${data.device ?? "Not specified"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CURRENT CGM STATUS:
- Current Glucose: ${data.currentGlucose ?? "N/A"} mg/dL (${status}) 🩺
- Status: ${
    status === "Low"
      ? "⚠️ Below target range"
      : status === "High"
        ? "⚠️ Above target range"
        : status === "Elevated"
          ? "⚡ Slightly elevated"
          : "✅ In range"
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 GLUCOSE STATISTICS:

24-Hour Metrics:
- Average: ${data.avg24h ? data.avg24h.toFixed(1) : "N/A"} mg/dL
- Min-Max: ${data.minGlucose ?? "N/A"} - ${data.maxGlucose ?? "N/A"} mg/dL
- Time In Range (70-140): ${data.timeInRange24h ? data.timeInRange24h.toFixed(1) : "N/A"}%
- Reading Count: ${data.readingCount24h ?? "N/A"}

7-Day Metrics:
- Average: ${data.avg7d ? data.avg7d.toFixed(1) : "N/A"} mg/dL
- Time In Range (70-140): ${data.timeInRange7d ? data.timeInRange7d.toFixed(1) : "N/A"}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DETECTED GLUCOSE PATTERNS (Last 24h):
${patterns}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 RECENT GLUCOSE READINGS (Last 20):
${readings}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDED HEALTH ACTIONS:
${actions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS FOR OLIVIA:
1. Greet ${data.name} warmly and acknowledge their current glucose status
2. Use the personal information to tailor your response
3. Reference the detected patterns and explain what they mean
4. Provide insights based on their 24-hour and 7-day trends
5. Highlight any high-priority recommendations
6. Celebrate improvements and encourage healthy habits
7. Offer empathy for challenges shown in the data
8. Ask a gentle follow-up question to continue supporting ${data.name}
`.trim();
};

export const AvatarAssistant = () => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { preferences } = useUserPreferences();
  const copy = useMemo(() => ASSISTANT_COPY[preferences.language] ?? ASSISTANT_COPY.English, [preferences.language]);

  const getCurrentUserId = useCallback(() => {
    if (typeof window === "undefined") return "user_001";
    try {
      return window.localStorage.getItem("currentUserId") ?? "user_001";
    } catch (storageError) {
      console.warn("localStorage unavailable, falling back to default user", storageError);
      return "user_001";
    }
  }, []);

  const fetchJson = useCallback(async <T,>(url: string): Promise<T | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch (requestError) {
      console.warn(`Request failed for ${url}`, requestError);
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserData | null> => {
      const base = backendUrl;
      const [userInfo, glucose, stats24, stats7, recent, patterns, actions] = await Promise.all([
        fetchJson<Record<string, any>>(`${base}/api/user/${userId}`),
        fetchJson<Record<string, any>>(`${base}/api/glucose/${userId}`),
        fetchJson<Record<string, any>>(`${base}/api/stats/${userId}`),
        fetchJson<Record<string, any>>(`${base}/api/stats/${userId}?days=7`),
        fetchJson<Array<Record<string, any>>>(`${base}/api/recent/${userId}/20`),
        fetchJson<Array<Record<string, any>>>(`${base}/api/patterns/${userId}`),
        fetchJson<Array<Record<string, any>>>(`${base}/api/actions`),
      ]);

      if (!userInfo) return null;

      return {
        userId,
        name: userInfo.name ?? "User",
        healthGoal: userInfo.health_goal ?? userInfo.healthGoal,
        conditions: userInfo.conditions,
        device: userInfo.cgm_device_type ?? userInfo.cgm_device,
        currentGlucose: glucose?.glucose,
        glucoseStatus: glucose?.status,
        avg24h: stats24?.stats?.avg_glucose,
        avg7d: stats7?.stats?.avg_glucose,
        minGlucose: stats24?.stats?.min_glucose,
        maxGlucose: stats24?.stats?.max_glucose,
        timeInRange24h: stats24?.time_in_range,
        timeInRange7d: stats7?.time_in_range,
        readingCount24h: stats24?.stats?.count,
        recentReadings:
          recent?.map((reading) => ({
            timestamp: reading.timestamp,
            glucose: reading.glucose_value ?? reading.glucose,
            status: reading.status,
          })) ?? [],
        patterns:
          patterns?.map((pattern) => ({
            pattern: pattern.pattern_type ?? pattern.pattern_name,
            severity: pattern.severity,
            confidence: pattern.confidence ?? 0,
            description: pattern.description,
          })) ?? [],
        actions:
          actions?.map((action) => ({
            title: action.action_title ?? action.title,
            detail: action.action_detail ?? action.detail,
            category: action.category,
            priority: action.priority ?? 0,
          })) ?? [],
      };
    },
    [fetchJson],
  );

  const createConversation = useCallback(async (profile: UserData) => {
    setLoading(true);
    setError(null);

    try {
      await fetch(`${backendUrl}/api/avatar/cleanup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch((cleanupError) => {
        console.warn("Avatar cleanup failed", cleanupError);
      });

      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      const personaId = import.meta.env.VITE_TAVUS_PERSONA_ID;
      const replicaId = import.meta.env.VITE_TAVUS_REPLICA_ID;

      if (!apiKey || !personaId || !replicaId) {
        throw new Error(
          "Missing Tavus credentials. Set VITE_TAVUS_API_KEY, VITE_TAVUS_PERSONA_ID, and VITE_TAVUS_REPLICA_ID.",
        );
      }

      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          replica_id: replicaId,
          persona_id: personaId,
          conversational_context: buildConversationalContext(profile),
          custom_greeting: `Hi ${profile.name}! 👋 I'm Olivia, your health butler. I see your recent glucose levels and patterns. How are you feeling today? What would you like to discuss?`,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Tavus API error (${response.status}): ${message}`);
      }

      const data = (await response.json()) as { conversation_url?: string };
      if (!data.conversation_url) {
        throw new Error("Conversation URL missing from Tavus response");
      }

      setConversationUrl(data.conversation_url);

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("lastTavusConversationUrl", data.conversation_url);
          const idFromUrl = new URL(data.conversation_url).searchParams.get("c")
            ?? data.conversation_url.split("/").pop()
            ?? "";
          if (idFromUrl) {
            window.localStorage.setItem("lastTavusConversationId", idFromUrl);
            await fetch(`${backendUrl}/api/avatar/save-conversation-id`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversation_url: data.conversation_url,
                conversation_id: idFromUrl,
                created_at: new Date().toISOString(),
              }),
            }).catch((persistError) => console.warn("Unable to persist conversation ID", persistError));
          }
        } catch (storageError) {
          console.warn("Failed to store conversation metadata", storageError);
        }
      }
    } catch (conversationError) {
      console.error("Failed to create Tavus conversation", conversationError);
      setError(conversationError instanceof Error ? conversationError.message : String(conversationError));
    } finally {
      setLoading(false);
    }
  }, []);

  const initialise = useCallback(async () => {
    setLoading(true);
    setError(null);
    setConversationUrl(null);

    const userId = getCurrentUserId();
    const profile = await fetchUserProfile(userId);

    if (!profile) {
      setLoading(false);
      setError("Unable to load CGM user data from the Butler backend.");
      return;
    }

    setUserData(profile);
    await createConversation(profile);
  }, [createConversation, fetchUserProfile, getCurrentUserId]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  const handleRetry = () => {
    void initialise();
  };

  const showLoading = loading && !conversationUrl;

  return (
    <section className="px-6 py-8 bg-white">
      <div className="space-y-3">
        <div className="space-y-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">{copy.badge}</p>
          <h2 className="text-2xl font-bold">{copy.title}</h2>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
          {userData && (
            <p className="text-xs text-muted-foreground/80">
              👤 {userData.name} · {copy.statusLabel} {userData.currentGlucose ?? "N/A"} mg/dL ({userData.glucoseStatus ?? "Unknown"})
            </p>
          )}
        </div>

        {showLoading && (
          <div className="flex flex-col items-center justify-center h-[420px] rounded-3xl border border-dashed border-slate-300 bg-white">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            <p className="mt-5 text-base font-semibold text-primary">{copy.preparing}</p>
            <p className="text-xs text-muted-foreground">{copy.preparingSubtitle}</p>
          </div>
        )}

        {!showLoading && error && (
          <div className="flex flex-col items-center justify-center h-[420px] rounded-3xl border border-destructive/50 bg-destructive/10 text-destructive">
            <h3 className="text-lg font-semibold mb-3">{copy.errorTitle}</h3>
            <p className="text-center text-sm text-destructive/80 max-w-xs mb-5">{copy.errorMessage}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90"
            >
              {copy.retry}
            </button>
          </div>
        )}

        {!showLoading && !error && conversationUrl && (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
            <iframe
              src={conversationUrl}
              title="Olivia - CGM Health Butler"
              className="w-full h-[520px]"
              allow="microphone;camera;display-capture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default AvatarAssistant;
