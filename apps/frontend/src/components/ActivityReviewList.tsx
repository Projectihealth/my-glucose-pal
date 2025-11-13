import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedVoiceInput } from "@/components/VoiceInput";
import type { ActivityLogCategory } from "@/context/ActivityLogContext";

interface ActivityReviewListProps {
  activities: ParsedVoiceInput[];
  onSaveAll: (activities: ParsedVoiceInput[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_COLORS: Record<ActivityLogCategory, string> = {
  food: "bg-orange-500/10 border-orange-500/30 text-orange-700",
  lifestyle: "bg-blue-500/10 border-blue-500/30 text-blue-700",
  medication: "bg-purple-500/10 border-purple-500/30 text-purple-700",
  sleep: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700",
  stress: "bg-red-500/10 border-red-500/30 text-red-700",
};

const CATEGORY_LABELS: Record<ActivityLogCategory, string> = {
  food: "Food",
  lifestyle: "Lifestyle",
  medication: "Medication",
  sleep: "Sleep",
  stress: "Stress",
};

export const ActivityReviewList = ({
  activities: initialActivities,
  onSaveAll,
  onCancel,
  isSubmitting = false,
}: ActivityReviewListProps) => {
  const [activities, setActivities] = useState<ParsedVoiceInput[]>(initialActivities);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const handleUpdate = (index: number, updated: Partial<ParsedVoiceInput>) => {
    setActivities((prev) =>
      prev.map((activity, i) => (i === index ? { ...activity, ...updated } : activity))
    );
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleSave = async () => {
    if (activities.length === 0) {
      onCancel();
      return;
    }
    await onSaveAll(activities);
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No activities to review</p>
        <Button onClick={onCancel} variant="ghost" className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {activities.length} {activities.length === 1 ? "activity" : "activities"} detected
          </p>
          <p className="text-xs text-muted-foreground">Tap to edit or remove</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => (
          <Card
            key={index}
            className={cn(
              "p-3 border-2 transition-all cursor-pointer",
              CATEGORY_COLORS[activity.category],
              expandedIndex === index && "ring-2 ring-primary/50"
            )}
            onClick={() => toggleExpanded(index)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {CATEGORY_LABELS[activity.category]}
                  </span>
                </div>
                <p className="font-medium text-sm truncate">{activity.title}</p>
                {activity.note && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {activity.note}
                  </p>
                )}
                {activity.medicationName && (
                  <p className="text-xs mt-1">
                    <span className="font-medium">{activity.medicationName}</span>
                    {activity.dose && <span className="text-muted-foreground"> • {activity.dose}</span>}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Expanded Edit Form */}
            {expandedIndex === index && (
              <div
                className="mt-3 pt-3 border-t space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <Label htmlFor={`title-${index}`} className="text-xs">
                    Title
                  </Label>
                  <Input
                    id={`title-${index}`}
                    value={activity.title}
                    onChange={(e) => handleUpdate(index, { title: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-${index}`} className="text-xs">
                    Category
                  </Label>
                  <select
                    id={`category-${index}`}
                    className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={activity.category}
                    onChange={(e) =>
                      handleUpdate(index, { category: e.target.value as ActivityLogCategory })
                    }
                  >
                    <option value="food">Food</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="medication">Medication</option>
                    <option value="sleep">Sleep</option>
                    <option value="stress">Stress</option>
                  </select>
                </div>

                {activity.category === "medication" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`med-${index}`} className="text-xs">
                        Medication
                      </Label>
                      <Input
                        id={`med-${index}`}
                        value={activity.medicationName || ""}
                        onChange={(e) => handleUpdate(index, { medicationName: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="e.g., Humalog"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`dose-${index}`} className="text-xs">
                        Dose
                      </Label>
                      <Input
                        id={`dose-${index}`}
                        value={activity.dose || ""}
                        onChange={(e) => handleUpdate(index, { dose: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="e.g., 6 units"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`note-${index}`} className="text-xs">
                    Notes
                  </Label>
                  <Textarea
                    id={`note-${index}`}
                    value={activity.note || ""}
                    onChange={(e) => handleUpdate(index, { note: e.target.value })}
                    className="text-sm min-h-[60px]"
                    placeholder="Add details..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting || activities.length === 0}
          className="flex-1"
        >
          <Check className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : `Save ${activities.length} ${activities.length === 1 ? "entry" : "entries"}`}
        </Button>
      </div>
    </div>
  );
};
