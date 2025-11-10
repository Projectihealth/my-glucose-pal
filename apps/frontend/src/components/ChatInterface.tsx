import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserPreferences } from "@/context/UserPreferencesContext";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const ChatInterface = () => {
  const { preferences } = useUserPreferences();
  const copy = useMemo(
    () => ({
      English: {
        sectionBadge: "Text concierge",
        sectionTitle: "Text Olivia",
        sectionSubtitle: "Ask questions about your CGM whenever, wherever.",
        initialMessage: "Hi! I’m Olivia. Tell me what’s on your mind and I’ll keep an eye on your glucose in the background.",
        placeholder: "Type your message...",
        offline: "I’m offline right now, but once the CGM Butler service is running I’ll jump back in with support.",
        startError: "I’m having trouble reaching my brain right now. Once the CGM Butler backend is available, feel free to try again.",
        thinking: "Olivia is thinking...",
        helperIntro:
          "I'm here to help you understand your glucose data and support you on your health journey. Think of me as your caring companion who's always in your corner!",
        helperTitle: "I can help you with:",
        helperItems: [
          "📊 Checking your current glucose levels",
          "🔍 Spotting patterns in your data",
          "💡 Suggesting personalized tips",
          "📈 Celebrating your progress together",
        ],
        helperOutro:
          "Feel free to ask me anything—I'm here for you!",
        helperTip: "💡 Tip: Click the video avatar to continue the conversation face to face (coming soon).",
      },
      "Español": {
        sectionBadge: "Conserje de chat",
        sectionTitle: "Envía mensajes a Olivia",
        sectionSubtitle: "Haz preguntas sobre tu CGM cuando quieras, donde quieras.",
        initialMessage: "¡Hola! Soy Olivia. Cuéntame qué tienes en mente y vigilaré tus niveles de glucosa.",
        placeholder: "Escribe tu mensaje...",
        offline: "Estoy desconectada por ahora, pero en cuanto el servicio se reactive volveré a ayudarte.",
        startError: "No puedo conectar con el backend ahora mismo. Inténtalo de nuevo cuando el servicio esté disponible.",
        thinking: "Olivia está pensando...",
        helperIntro:
          "Estoy aquí para ayudarte a entender tus datos de glucosa y acompañarte en tu camino de salud. ¡Piensa en mí como tu compañera que siempre está de tu lado!",
        helperTitle: "Puedo ayudarte con:",
        helperItems: [
          "📊 Revisar tu glucosa actual",
          "🔍 Detectar patrones en tus datos",
          "💡 Sugerir consejos personalizados",
          "📈 Celebrar tus progresos",
        ],
        helperOutro: "Pregúntame lo que necesites—¡estoy aquí para ti!",
        helperTip: "💡 Consejo: Haz clic en el avatar de video para continuar la conversación cara a cara (pronto).",
      },
      "中文": {
        sectionBadge: "文字助手",
        sectionTitle: "给 Olivia 发消息",
        sectionSubtitle: "随时随地提问，获取 CGM 支持。",
        initialMessage: "你好！我是 Olivia。告诉我你的想法，我会持续关注你的血糖数据。",
        placeholder: "输入你的消息...",
        offline: "我现在暂时离线，等 CGM Butler 服务恢复后会立刻回复你。",
        startError: "目前无法连接后台，请稍后再试。",
        thinking: "Olivia 正在思考...",
        helperIntro: "我会陪你一起解读血糖数据，支持你的健康旅程。把我当成始终站在你这边的贴心伙伴吧！",
        helperTitle: "我可以帮你：",
        helperItems: [
          "📊 查看当前血糖值",
          "🔍 识别数据中的模式",
          "💡 提供个性化建议",
          "📈 一起庆祝你的进步",
        ],
        helperOutro: "随时都可以来问我问题——我一直都在！",
        helperTip: "💡 小贴士：点击视频头像即可面对面交流（即将上线）。",
      },
    })[preferences.language] ?? {
      sectionBadge: "Text concierge",
      sectionTitle: "Text Olivia",
      sectionSubtitle: "Ask questions about your CGM whenever, wherever.",
      initialMessage: "Hi! I’m Olivia. Tell me what’s on your mind and I’ll keep an eye on your glucose in the background.",
      placeholder: "Type your message...",
      offline: "I’m offline right now, but once the CGM Butler service is running I’ll jump back in with support.",
      startError: "I’m having trouble reaching my brain right now. Once the CGM Butler backend is available, feel free to try again.",
      thinking: "Olivia is thinking...",
      helperIntro:
        "I'm here to help you understand your glucose data and support you on your health journey. Think of me as your caring companion who's always in your corner!",
      helperTitle: "I can help you with:",
      helperItems: [
        "📊 Checking your current glucose levels",
        "🔍 Spotting patterns in your data",
        "💡 Suggesting personalized tips",
        "📈 Celebrating your progress together",
      ],
      helperOutro: "Feel free to ask me anything—I'm here for you!",
      helperTip: "💡 Tip: Click the video avatar to continue the conversation face to face (coming soon).",
    },
    [preferences.language],
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: copy.initialMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = (import.meta.env.VITE_CGM_BUTLER_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  const getCurrentUserId = useCallback(() => {
    if (typeof window === "undefined") return "user_001";
    try {
      return window.localStorage.getItem("currentUserId") ?? "user_001";
    } catch (storageError) {
      console.warn("localStorage unavailable, falling back to default user", storageError);
      return "user_001";
    }
  }, []);

  useEffect(() => {
    const userId = getCurrentUserId();
    let cancelled = false;

    const startConversation = async () => {
      try {
        setInitializing(true);
        setError(null);
        const response = await fetch(`${backendUrl}/api/avatar/gpt/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Start failed with status ${response.status}`);
        }

        const data: { success?: boolean; message?: string } = await response.json();
        if (data?.success === false) {
          throw new Error(data.message || "Failed to start conversation");
        }

        if (!cancelled) {
          setInitializing(false);
        }
      } catch (startError) {
        console.error("Unable to start GPT conversation", startError);
        if (!cancelled) {
          setError(startError instanceof Error ? startError.message : String(startError));
          setInitializing(false);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: copy.startError,
            },
          ]);
        }
      }
    };

    void startConversation();

    return () => {
      cancelled = true;
      void fetch(`${backendUrl}/api/avatar/gpt/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }).catch((endError) => console.warn("Unable to end GPT conversation", endError));
    };
  }, [backendUrl, copy.startError, getCurrentUserId]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || initializing || isSending) return;

    const userId = getCurrentUserId();
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsSending(true);
    setError(null);

    const sendMessage = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/avatar/gpt/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, message: trimmed }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Chat failed with status ${response.status}`);
        }

        const data: { success?: boolean; message?: string } = await response.json();
        if (data?.success === false || !data?.message) {
          throw new Error(data?.message || "The assistant didn’t send a reply.");
        }

        setMessages((prev) => [...prev, { role: "assistant", content: data.message as string }]);
      } catch (sendError) {
        console.error("GPT chat error", sendError);
        setMessages((prev) => [...prev, { role: "assistant", content: copy.offline }]);
        setError(sendError instanceof Error ? sendError.message : String(sendError));
      } finally {
        setIsSending(false);
      }
    };

    void sendMessage();
  };

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: copy.initialMessage }];
      }
      return prev;
    });
  }, [copy.initialMessage]);

  return (
    <section className="px-6 py-8 bg-white">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">{copy.sectionBadge}</p>
          <h2 className="text-2xl font-bold">{copy.sectionTitle}</h2>
          <p className="text-sm text-muted-foreground">{copy.sectionSubtitle}</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 space-y-3 text-sm text-muted-foreground">
          <p className="text-base font-semibold text-foreground">{copy.helperIntro}</p>
          <div className="space-y-2">
            <p className="text-foreground font-medium">{copy.helperTitle}</p>
            <ul className="list-disc pl-5 space-y-1">
              {copy.helperItems.map((item) => (
                <li key={item} className="text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-foreground">{copy.helperOutro}</p>
          <p className="text-xs text-primary/80">{copy.helperTip}</p>
        </div>

        <Card className="p-4 rounded-3xl shadow-sm border-border/60">
          <div className="space-y-4 mb-5 max-h-[380px] overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className={message.role === "assistant" ? "gradient-primary text-white" : "bg-muted"}>
                    {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="gradient-primary text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-3.5 py-2.5 bg-muted text-sm text-muted-foreground animate-pulse">
                  {copy.thinking}
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive/80 mb-2">{error}</p>
          )}

          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              disabled={initializing}
              placeholder={copy.placeholder}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              className="gradient-primary text-white border-0 w-12 h-12 p-0"
              disabled={initializing || isSending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
