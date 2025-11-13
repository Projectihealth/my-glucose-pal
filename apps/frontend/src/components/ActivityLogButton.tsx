import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActivityLog } from "@/context/ActivityLogContext";
import type { ActivityLogCategory, MealType } from "@/context/ActivityLogContext";
import { useToast } from "@/components/ui/use-toast";
import { VoiceInput, ParsedVoiceInput } from "@/components/VoiceInput";
import { ActivityReviewList } from "@/components/ActivityReviewList";
import { Mic, Keyboard } from "lucide-react";

const defaultTimestamp = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export const ActivityLogButton = () => {
  const { addLog } = useActivityLog();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<ActivityLogCategory>("food");
  const [timestamp, setTimestamp] = useState(defaultTimestamp);
  const [medicationName, setMedicationName] = useState("");
  const [dose, setDose] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "review" | "manual">("voice");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [parsedActivities, setParsedActivities] = useState<ParsedVoiceInput[]>([]);

  const isMedication = category === "medication";
  const isFood = category === "food";

  const isSubmitDisabled = useMemo(() => {
    if (!title.trim() || !timestamp) return true;
    if (isMedication && !medicationName.trim()) return true;
    return false;
  }, [title, timestamp, isMedication, medicationName]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle("");
    setNote("");
    setCategory("food");
    setTimestamp(defaultTimestamp());
    setMedicationName("");
    setDose("");
    setMealType("breakfast");
    setVoiceTranscript("");
    setInputMode("voice");
  };

  const handleVoiceTranscriptChange = (transcript: string) => {
    setVoiceTranscript(transcript);
  };

  const handleVoiceParseComplete = (parsed: ParsedVoiceInput[]) => {
    if (parsed && parsed.length > 0) {
      setParsedActivities(parsed);
      // Switch to review mode to show all parsed activities
      setInputMode("review");
    }
  };

  const toggleInputMode = () => {
    if (inputMode === "review") {
      // Go back to voice mode
      setInputMode("voice");
      setParsedActivities([]);
    } else {
      setInputMode((prev) => (prev === "voice" ? "manual" : "voice"));
    }
  };

  const handleSaveAllActivities = async (activities: ParsedVoiceInput[]) => {
    setIsSubmitting(true);
    try {
      const results = [];
      for (const activity of activities) {
        const timestampUtc = formatTimestampForBackend(timestamp);
        console.log('[ActivityLogButton] Saving activity:', {
          title: activity.title,
          timestamp: timestampUtc,
          timestampInput: timestamp
        });
        const result = await addLog({
          title: activity.title.trim(),
          category: activity.category,
          note: activity.note?.trim() || undefined,
          timestamp: timestampUtc,
          medicationName:
            activity.category === "medication" ? activity.medicationName?.trim() : undefined,
          dose: activity.category === "medication" ? activity.dose?.trim() || undefined : undefined,
          mealType: activity.category === "food" ? activity.mealType : undefined,
        });
        console.log('[ActivityLogButton] Activity saved, result:', result);
        results.push(result);
      }

      toast({
        title: "Logged",
        description: `${activities.length} ${activities.length === 1 ? "entry" : "entries"} saved to your timeline.`,
      });

      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to log activities", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Unable to save activity logs.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestampForBackend = (input: string) => {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const timestampUtc = formatTimestampForBackend(timestamp);
      await addLog({
        title: title.trim(),
        category,
        note: note.trim() || undefined,
        timestamp: timestampUtc,
        medicationName: isMedication ? medicationName.trim() : undefined,
        dose: isMedication ? dose.trim() || undefined : undefined,
        mealType: isFood ? mealType : undefined,
      });

      toast({
        title: "Logged",
        description: "Your entry will appear on today's CGM timeline.",
      });

      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to log activity", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Unable to save activity log.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-600/90 text-sm font-semibold shadow-lg shadow-blue-600/40"
        >
          <Mic className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Log an activity</DialogTitle>
              <DialogDescription>
                {inputMode === "voice" && "Speak naturally to log your activity"}
                {inputMode === "review" && "Review and edit before saving"}
                {inputMode === "manual" && "Capture meals, activity, or medication doses"}
              </DialogDescription>
            </div>
            {inputMode !== "review" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleInputMode}
                className="shrink-0"
              >
                {inputMode === "voice" ? (
                  <Keyboard className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </DialogHeader>
        {inputMode === "voice" ? (
          <div className="py-4">
            <VoiceInput
              onTranscriptChange={handleVoiceTranscriptChange}
              onParseComplete={handleVoiceParseComplete}
              autoStart={true}
            />
          </div>
        ) : inputMode === "review" ? (
          <ActivityReviewList
            activities={parsedActivities}
            onSaveAll={handleSaveAllActivities}
            onCancel={() => setInputMode("voice")}
            isSubmitting={isSubmitting}
          />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="log-title">Title</Label>
            <Input
              id="log-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g., Chickpea salad or Evening walk"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="log-category">Category</Label>
              <select
                id="log-category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                value={category}
                onChange={(event) => setCategory(event.target.value as ActivityLogCategory)}
              >
                <option value="food">Food</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="medication">Medication</option>
                <option value="sleep">Sleep</option>
                <option value="stress">Stress</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-timestamp">Date &amp; time</Label>
              <Input
                id="log-timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(event) => setTimestamp(event.target.value)}
                required
              />
            </div>
          </div>
          {isFood && (
            <div className="space-y-2">
              <Label htmlFor="log-meal-type">Meal type</Label>
              <select
                id="log-meal-type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                value={mealType}
                onChange={(event) => setMealType(event.target.value as MealType)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          )}
          {isMedication && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="log-medication">Medication</Label>
                <Input
                  id="log-medication"
                  value={medicationName}
                  onChange={(event) => setMedicationName(event.target.value)}
                  placeholder="e.g., Humalog"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-dose">Dose</Label>
                <Input
                  id="log-dose"
                  value={dose}
                  onChange={(event) => setDose(event.target.value)}
                  placeholder="e.g., 6 units"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="log-note">Notes</Label>
            <Textarea
              id="log-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add prep details, portion size, or how you felt."
              rows={3}
            />
          </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitDisabled || isSubmitting} className="w-full">
                {isSubmitting ? "Saving…" : "Save to timeline"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogButton;
