import { AvatarAssistant } from "@/components/AvatarAssistant";
import { ChatInterface } from "@/components/ChatInterface";

const Coach = () => {
  return (
    <div className="min-h-full">
      <section className="px-6 pt-12 pb-8 bg-muted/40 text-left space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">Coach</p>
        <h1 className="text-3xl font-bold leading-tight">Your Personal CGM Butler</h1>
        <p className="text-sm text-muted-foreground">
          Olivia brings together real-time CGM insights. Drop in any
          time you want guidance, encouragement, or a quick check-in.
        </p>
      </section>
      <AvatarAssistant />
      <ChatInterface />
    </div>
  );
};

export default Coach;
