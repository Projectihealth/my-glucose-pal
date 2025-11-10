import { Card } from "@/components/ui/card";
import { Bell, Brain, MessageSquare, TrendingUp } from "lucide-react";

export const Features = () => {
  return (
    <section className="px-6 py-12 bg-muted/40">
      <div className="max-w-full">
        <div className="text-left space-y-2 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why you&apos;ll love it</p>
          <h2 className="text-2xl font-bold">Premium Butler Features</h2>
          <p className="text-sm text-muted-foreground">
            Designed for quick, on-the-go check-ins with the same intelligence as the web dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-5 rounded-3xl shadow-sm border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Context-Aware Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Learns from every chat to tailor insights precisely to your day.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl shadow-sm border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl gradient-secondary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Natural Conversations</h3>
                <p className="text-sm text-muted-foreground">
                  Log meals and feelings without leaving the flow of a message thread.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl shadow-sm border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  See trends at a glance and anticipate tomorrow&apos;s highs and lows.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-3xl shadow-sm border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-chart-4 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Smart Daily Nudges</h3>
                <p className="text-sm text-muted-foreground">
                  Gentle reminders that celebrate wins and guide next best actions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
