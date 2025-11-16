import { useMemo, useState, useCallback } from "react";
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
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useGlucoseCalendarData } from "@/hooks/useGlucoseTrend";
import ActivityLogButton from "@/components/ActivityLogButton";

const Overview = () => {
  const { preferences } = useUserPreferences();
  const { allDays } = useGlucoseCalendarData(preferences.locale);

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: preferences.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [preferences.timezone],
  );

  const utcToLocal = useCallback((utcDay: string) => dayFormatter.format(new Date(`${utcDay}T00:00:00Z`)), [dayFormatter]);

  const localToUtcMap = useMemo(() => {
    const map = new Map<string, string>();
    allDays.forEach((utcDay) => {
      map.set(utcToLocal(utcDay), utcDay);
    });
    return map;
  }, [allDays, utcToLocal]);

  const convertLocalToUtc = useCallback(
    (localDay: string) => localToUtcMap.get(localDay) ?? localDay,
    [localToUtcMap],
  );

  const [selectedDayUtc, setSelectedDayUtc] = useState<string | null>(null);
  const [selectedDayLocal, setSelectedDayLocal] = useState<string | null>(null);
  const [timelineDay, setTimelineDay] = useState<{ utc: string; local: string } | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const handleChartDayChange = (dayUtc: string | null) => {
    setSelectedDayUtc(dayUtc);
    if (dayUtc) {
      setSelectedDayLocal(utcToLocal(dayUtc));
    }
  };

  const handleCalendarSelect = (localDay: string) => {
    const utcDay = convertLocalToUtc(localDay);
    setSelectedDayLocal(localDay);
    setSelectedDayUtc(utcDay);
    setTimelineDay({ utc: utcDay, local: localDay });
    setIsTimelineOpen(true);
  };

  return (
    <div className="min-h-full space-y-8 relative">
      <GlucoseChart selectedDay={selectedDayUtc} onDayChange={handleChartDayChange} />
      <Dashboard selectedDay={selectedDayUtc} />
      <MonthlyCalendar selectedDay={selectedDayLocal} onSelectDay={handleCalendarSelect} />

      {/* Floating Activity Log Button */}
      <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <ActivityLogButton />
        </div>
      </div>

      <Dialog open={isTimelineOpen && Boolean(timelineDay)} onOpenChange={(open) => {
        setIsTimelineOpen(open);
        if (!open) setTimelineDay(null);
      }}>
        <DialogContent className="max-w-5xl w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle>Daily timeline</DialogTitle>
          </DialogHeader>
          {timelineDay && <DayTimeline dayUtc={timelineDay.utc} dayLocal={timelineDay.local} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Overview;
