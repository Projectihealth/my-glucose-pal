import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Apple, Moon } from "lucide-react";

export const Dashboard = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Your Health Dashboard</h2>
          <p className="text-xl text-muted-foreground">
            Track your progress and insights at a glance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">94%</span>
            </div>
            <h3 className="font-semibold mb-1">Time in Range</h3>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-accent">15</span>
            </div>
            <h3 className="font-semibold mb-1">Active Days</h3>
            <p className="text-sm text-muted-foreground">This month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Apple className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-secondary">8/10</span>
            </div>
            <h3 className="font-semibold mb-1">Nutrition Score</h3>
            <p className="text-sm text-muted-foreground">Today</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-chart-4 flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>7.5h</span>
            </div>
            <h3 className="font-semibold mb-1">Sleep Quality</h3>
            <p className="text-sm text-muted-foreground">Average</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Daily Patterns</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Morning (6-12)</span>
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Afternoon (12-18)</span>
                  <span className="text-sm text-muted-foreground">Good</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Evening (18-24)</span>
                  <span className="text-sm text-muted-foreground">Moderate</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Night (0-6)</span>
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Today's Insights</h3>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Great morning routine!</p>
                  <p className="text-sm text-muted-foreground">Your fasting glucose was perfect today.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-accent/10">
                <Activity className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Exercise detected</p>
                  <p className="text-sm text-muted-foreground">30-minute walk improved insulin sensitivity.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-secondary/10">
                <Apple className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium">Smart meal choice</p>
                  <p className="text-sm text-muted-foreground">Lunch kept you stable for 4 hours.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
