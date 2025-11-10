import { useState } from "react";
import { GlucoseChart } from "@/components/GlucoseChart";
import { Dashboard } from "@/components/Dashboard";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { DayTimeline } from "@/components/DayTimeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Overview = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [timelineDay, setTimelineDay] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const openTimelineForDay = (day: string) => {
    setSelectedDay(day);
    setTimelineDay(day);
    setIsTimelineOpen(true);
  };

  return (
    <div className="min-h-full space-y-8">
      <GlucoseChart selectedDay={selectedDay} onDayChange={setSelectedDay} />
      <MonthlyCalendar selectedDay={selectedDay} onSelectDay={openTimelineForDay} />
      <Dashboard selectedDay={selectedDay} />

      <Dialog open={isTimelineOpen && Boolean(timelineDay)} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="max-w-5xl w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle>Daily timeline</DialogTitle>
          </DialogHeader>
          {timelineDay && <DayTimeline selectedDay={timelineDay} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Overview;
