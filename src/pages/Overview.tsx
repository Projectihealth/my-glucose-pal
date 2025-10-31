import { useState } from "react";
import { GlucoseChart } from "@/components/GlucoseChart";
import { Dashboard } from "@/components/Dashboard";

const Overview = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <div className="min-h-full">
      <GlucoseChart selectedDay={selectedDay} onDayChange={setSelectedDay} />
      <Dashboard selectedDay={selectedDay} />
    </div>
  );
};

export default Overview;
