import { useState } from "react";
import { GlucoseChart } from "@/components/GlucoseChart";
import { Dashboard } from "@/components/Dashboard";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { DayTimeline } from "@/components/DayTimeline";

const Overview = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <div className="min-h-full space-y-8">
      <MonthlyCalendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      <GlucoseChart selectedDay={selectedDay} onDayChange={setSelectedDay} />
      <DayTimeline selectedDay={selectedDay} />
      <Dashboard selectedDay={selectedDay} />
    </div>
  );
};

export default Overview;
