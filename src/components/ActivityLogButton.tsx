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
import type { ActivityLogCategory } from "@/context/ActivityLogContext";
import { useToast } from "@/components/ui/use-toast";

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

  const isMedication = category === "medication";

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
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    addLog({
      title: title.trim(),
      category: category === "food" ? "food" : category === "lifestyle" ? "lifestyle" : "medication",
      note: note.trim() || undefined,
      timestamp: new Date(timestamp).toISOString(),
      medicationName: isMedication ? medicationName.trim() : undefined,
      dose: isMedication ? dose.trim() || undefined : undefined,
    });

    toast({
      title: "Logged",
      description: "Your entry will appear on today’s CGM timeline.",
    });

    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-600/90 text-sm font-semibold"
        >
          Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log an activity</DialogTitle>
          <DialogDescription>
            Capture meals, activity, or medication doses so they show alongside your CGM data.
          </DialogDescription>
        </DialogHeader>
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
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                value={category}
                onChange={(event) => setCategory(event.target.value as ActivityLogCategory)}
              >
                <option value="food">Food</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="medication">Medication</option>
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
            <Button type="submit" disabled={isSubmitDisabled} className="w-full">
              Save to timeline
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogButton;
