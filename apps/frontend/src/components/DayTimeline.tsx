import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Dumbbell, Moon, UtensilsCrossed, Pencil, Trash2, X, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useActivityLog, type ActivityLogCategory, type MealType } from "@/context/ActivityLogContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface DayTimelineProps {
  dayUtc: string | null;
  dayLocal?: string | null;
}

type TimelineKind = "meal" | "activity" | "sleep" | "stress";

interface TimelineItem {
  id: string;
  label: string;
  description?: string;
  minutesOfDayUtc: number;
  kind: TimelineKind;
  timestampUtc: string;
  mealType?: string;
  medicationName?: string;
  dose?: string;
}

const buildLogItems = (
  dayUtc: string,
  dayLocal: string | null,
  logs: ReturnType<typeof useActivityLog>["logs"],
  timezone: string,
) => {
  console.log('[DayTimeline] buildLogItems called:', { dayUtc, dayLocal, totalLogs: logs.length });

  // If we have a local day, filter by local day using timezone conversion
  // Otherwise fall back to UTC day matching
  const filtered = logs.filter((log) => {
    if (dayLocal && timezone) {
      // Convert log timestamp to local day
      const logDate = new Date(log.timestamp);
      const localDay = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(logDate);
      return localDay === dayLocal;
    }
    // Fallback to UTC day matching
    return log.day === dayUtc;
  });

  console.log('[DayTimeline] Filtered logs for day:', { dayUtc, dayLocal, filteredCount: filtered.length, filtered });

  return filtered.map((log) => ({
    id: log.id,
    label: log.title,
    description: log.note,
    minutesOfDayUtc: log.minutesOfDayUtc,
    kind: mapCategoryToKind(log.category as string),
    timestampUtc: log.timestamp,
    mealType: log.mealType,
    medicationName: log.medicationName,
    dose: log.dose,
  }));
};

const prepareTimelineItems = (
  dayUtc: string,
  dayLocal: string | null,
  logs: ReturnType<typeof useActivityLog>["logs"],
  timezone: string,
) => {
  const items: TimelineItem[] = buildLogItems(dayUtc, dayLocal, logs, timezone);
  return items.sort((a, b) => a.minutesOfDayUtc - b.minutesOfDayUtc);
};

const formatTimestamp = (iso: string, locale: string, timeZone: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(iso));

const mapCategoryToKind = (category: string): TimelineKind => {
  switch (category) {
    case "food":
      return "meal";
    case "lifestyle":
      return "activity";
    case "medication":
      return "activity";
    case "sleep":
      return "sleep";
    case "stress":
      return "stress";
    default:
      return "activity";
  }
};

const KIND_CONFIG: Record<TimelineKind, { label: string; icon: LucideIcon; badgeClass: string }> = {
  meal: {
    label: "Meal",
    icon: UtensilsCrossed,
    badgeClass: "bg-amber-100 text-amber-900",
  },
  activity: {
    label: "Activity",
    icon: Dumbbell,
    badgeClass: "bg-emerald-100 text-emerald-900",
  },
  sleep: {
    label: "Sleep",
    icon: Moon,
    badgeClass: "bg-slate-900 text-white",
  },
  stress: {
    label: "Stress",
    icon: Brain,
    badgeClass: "bg-rose-100 text-rose-900",
  },
};

export const DayTimeline = ({ dayUtc, dayLocal }: DayTimelineProps) => {
  const { preferences } = useUserPreferences();
  const { logs, deleteLog, updateLog } = useActivityLog();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    category: ActivityLogCategory;
    mealType?: MealType;
    medicationName?: string;
    dose?: string;
    note?: string;
  }>({
    title: "",
    category: "food",
  });

  console.log('[DayTimeline] Component render:', { dayUtc, dayLocal, totalLogs: logs.length });

  const timelineItems = useMemo(() => {
    if (!dayUtc) return [];
    return prepareTimelineItems(dayUtc, dayLocal, logs, preferences.timezone);
  }, [dayUtc, dayLocal, logs, preferences.timezone]);

  const handleEdit = (item: TimelineItem) => {
    const log = logs.find(l => l.id === item.id);
    if (!log) return;

    setEditForm({
      title: log.title,
      category: log.category,
      mealType: log.mealType,
      medicationName: log.medicationName,
      dose: log.dose,
      note: log.note,
    });
    setEditingId(item.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ title: "", category: "food" });
  };

  const handleSave = async (id: string) => {
    const result = await updateLog(id, editForm);
    if (result) {
      toast({
        title: "Log updated",
        description: "Your activity log has been updated successfully.",
      });
      setEditingId(null);
      setEditForm({ title: "", category: "food" });
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update the log. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteLog(id);
    if (success) {
      toast({
        title: "Log deleted",
        description: "Your activity log has been deleted.",
      });
      if (editingId === id) {
        setEditingId(null);
        setEditForm({ title: "", category: "food" });
      }
    } else {
      toast({
        title: "Delete failed",
        description: "Failed to delete the log. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!dayUtc) {
    return (
      <Card className="mx-6 mt-6 p-6 rounded-3xl border-dashed border-border text-muted-foreground">
        Select any day on the calendar to review the meals, activities, sleep, or stress notes logged for that date.
      </Card>
    );
  }

  const displayDate = dayLocal
    ? new Date(`${dayLocal}T00:00:00`)
    : new Date(`${dayUtc}T00:00:00Z`);

  return (
    <Card className="mx-6 mt-6 rounded-3xl border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily view</p>
          <h2 className="text-2xl font-semibold">
            {new Intl.DateTimeFormat(preferences.locale, { dateStyle: "full", timeZone: dayLocal ? preferences.timezone : "UTC" }).format(
              displayDate,
            )}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {timelineItems.length ? `${timelineItems.length} logs recorded` : "No logs yet"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {(Object.keys(KIND_CONFIG) as TimelineKind[]).map((kind) => {
          const config = KIND_CONFIG[kind];
          const count = timelineItems.filter((item) => item.kind === kind).length;
          return (
            <div
              key={kind}
              className={cn(
                "rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm flex items-center justify-between",
                count === 0 && "opacity-50",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", config.badgeClass)}>
                  <config.icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-semibold">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{count ? `${count} log${count > 1 ? "s" : ""}` : "No logs"}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{count ? "Tracked" : "Pending"}</span>
            </div>
          );
        })}
      </div>

      {timelineItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          You haven't logged anything for this day yet. Tap "Log" on the home screen to capture meals, movement, sleep, or stress notes.
        </div>
      ) : (
        <ol className="space-y-3">
          {timelineItems.map((item) => {
            const config = KIND_CONFIG[item.kind];
            const isEditing = editingId === item.id;

            return (
              <li
                key={item.id}
                className="rounded-2xl border border-border/60 bg-background/80 p-4 flex items-start gap-3"
              >
                <span className={cn("mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl", config.badgeClass)}>
                  <config.icon className="w-4 h-4" />
                </span>

                {isEditing ? (
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-title-${item.id}`} className="text-xs">Title</Label>
                      <Input
                        id={`edit-title-${item.id}`}
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-category-${item.id}`} className="text-xs">Category</Label>
                      <select
                        id={`edit-category-${item.id}`}
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ActivityLogCategory })}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="food">Food</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="medication">Medication</option>
                        <option value="sleep">Sleep</option>
                        <option value="stress">Stress</option>
                      </select>
                    </div>

                    {editForm.category === "food" && (
                      <div className="space-y-2">
                        <Label htmlFor={`edit-meal-${item.id}`} className="text-xs">Meal type</Label>
                        <select
                          id={`edit-meal-${item.id}`}
                          value={editForm.mealType || "breakfast"}
                          onChange={(e) => setEditForm({ ...editForm, mealType: e.target.value as MealType })}
                          className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                    )}

                    {editForm.category === "medication" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-med-${item.id}`} className="text-xs">Medication name</Label>
                          <Input
                            id={`edit-med-${item.id}`}
                            value={editForm.medicationName || ""}
                            onChange={(e) => setEditForm({ ...editForm, medicationName: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-dose-${item.id}`} className="text-xs">Dose</Label>
                          <Input
                            id={`edit-dose-${item.id}`}
                            value={editForm.dose || ""}
                            onChange={(e) => setEditForm({ ...editForm, dose: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`edit-note-${item.id}`} className="text-xs">Note (optional)</Label>
                      <Textarea
                        id={`edit-note-${item.id}`}
                        value={editForm.note || ""}
                        onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                        className="min-h-[60px] text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(item.id)}
                        className="flex-1 h-8"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 h-8"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        className="h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold truncate">{item.label || config.label}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(item.timestampUtc, preferences.locale, preferences.timezone)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="h-6 w-6 p-0 ml-1"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                      {item.mealType && item.kind === "meal" && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs font-medium capitalize bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
                            {item.mealType}
                          </span>
                        </>
                      )}
                      {item.medicationName && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs font-medium text-purple-700">
                            {item.medicationName}
                          </span>
                        </>
                      )}
                      {item.dose && (
                        <span className="text-xs text-muted-foreground">
                          ({item.dose})
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1.5 text-xs text-muted-foreground/90 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
};
