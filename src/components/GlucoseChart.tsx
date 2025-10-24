import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const generateMockData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      glucose: 80 + Math.random() * 60 + Math.sin(i / 3) * 20,
      predicted: i < 6 ? 80 + Math.random() * 60 + Math.sin(i / 3) * 20 : null,
    });
  }
  return data;
};

export const GlucoseChart = () => {
  const data = generateMockData();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Real-Time Glucose Monitoring</h2>
          <p className="text-xl text-muted-foreground">
            Live data with AI-powered predictions
          </p>
        </div>

        <Card className="p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Current: 98 mg/dL</h3>
              <p className="text-muted-foreground">Within target range</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-sm">Predicted</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 180]} tick={{ fontSize: 12 }} label={{ value: 'mg/dL', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="glucose" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fill="url(#colorGlucose)"
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorPredicted)"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent">
            <p className="text-sm font-medium text-accent-foreground">
              🔮 Prediction: Your glucose is expected to rise slightly after your scheduled lunch. 
              Consider a lighter carb option to stay in range.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
