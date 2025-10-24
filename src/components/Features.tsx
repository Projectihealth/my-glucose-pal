import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, TrendingUp, Bell } from "lucide-react";

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Premium Butler Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI companion combines advanced analytics with personalized care
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Context-Aware Intelligence</h3>
            <p className="text-muted-foreground mb-4">
              Your butler learns from every interaction, comparing your goals against data gaps 
              to provide increasingly personalized recommendations.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Identifies patterns you might miss</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Proactively asks clarifying questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Adapts to your lifestyle changes</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl gradient-secondary flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Natural Conversations</h3>
            <p className="text-muted-foreground mb-4">
              Log your meals, activities, and feelings through simple chats. 
              No complex forms or medical jargon required.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-secondary">✓</span>
                <span>Voice and text support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary">✓</span>
                <span>Understands context and preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary">✓</span>
                <span>Available 24/7 for questions</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Predictive Analytics</h3>
            <p className="text-muted-foreground mb-4">
              See how different foods and activities will affect your glucose before you make decisions.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Meal impact predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Exercise response forecasts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Personalized timing recommendations</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-chart-4 flex items-center justify-center mb-6">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Smart Daily Nudges</h3>
            <p className="text-muted-foreground mb-4">
              Receive one thoughtfully timed, actionable recommendation each day based on your patterns.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span style={{ color: 'hsl(var(--chart-4))' }}>✓</span>
                <span>Never overwhelming, always helpful</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'hsl(var(--chart-4))' }}>✓</span>
                <span>Celebrates your achievements</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'hsl(var(--chart-4))' }}>✓</span>
                <span>Identifies risks before they happen</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
};
