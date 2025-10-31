import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import type { SupportedLanguage } from "@/context/UserPreferencesContext";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    dailyInsights: true,
    glucoseAlerts: true,
    weeklySummary: false,
  });

  const [draft, setDraft] = useState<{ timezone: string; language: SupportedLanguage }>({
    timezone: preferences.timezone,
    language: preferences.language,
  });

  useEffect(() => {
    setDraft({ timezone: preferences.timezone, language: preferences.language });
  }, [preferences.timezone, preferences.language]);

  const profileCopy = useMemo(
    () => ({
      English: {
        heading: "Notifications",
        preferencesHeading: "Preferences",
        accountHeading: "Account actions",
        save: "Save settings",
        toastTitle: "Preferences updated",
        toastDescription: "Your language and time zone are now active across the app.",
        export: "Export data",
        deactivate: "Deactivate account",
      },
      "Español": {
        heading: "Notificaciones",
        preferencesHeading: "Preferencias",
        accountHeading: "Acciones de la cuenta",
        save: "Guardar configuración",
        toastTitle: "Preferencias actualizadas",
        toastDescription: "Tu idioma y zona horaria ya se aplican en toda la app.",
        export: "Exportar datos",
        deactivate: "Desactivar cuenta",
      },
      "中文": {
        heading: "通知",
        preferencesHeading: "偏好设置",
        accountHeading: "账户操作",
        save: "保存设置",
        toastTitle: "偏好已更新",
        toastDescription: "语言和时区已在应用中生效。",
        export: "导出数据",
        deactivate: "停用账户",
      },
    })[preferences.language] ?? {
      heading: "Notifications",
      preferencesHeading: "Preferences",
      accountHeading: "Account actions",
      save: "Save settings",
      toastTitle: "Preferences updated",
      toastDescription: "Your language and time zone are now active across the app.",
      export: "Export data",
      deactivate: "Deactivate account",
    },
    [preferences.language],
  );

  const hasChanges =
    draft.timezone !== preferences.timezone || draft.language !== preferences.language;

  const handleSave = () => {
    if (!hasChanges) return;
    updatePreferences({ timezone: draft.timezone, language: draft.language });
    toast({ title: profileCopy.toastTitle, description: profileCopy.toastDescription });
  };

  return (
    <div className="min-h-full space-y-6">
      <section className="px-6 pt-16 pb-8 bg-white border-b border-border/60 text-left space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="gradient-primary text-white text-xl">J</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">John Rivera</h1>
            <p className="text-sm text-muted-foreground">Living with Type 1 diabetes · Last sync 10m ago</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Email</p>
            <p>john.rivera@example.com</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Coach tier</p>
            <p>Premium (Beta)</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Glucose goal</p>
            <p>Time in range ≥ 75%</p>
          </div>
          <div>
            <p className="font-medium text-foreground">CGM device</p>
            <p>Dexcom G7</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Preferred language</p>
            <p>{preferences.language}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Time zone</p>
            <p>{preferences.timezone.replace("_", " ")}</p>
          </div>
        </div>
      </section>

      <section className="px-6 space-y-4">
        <h2 className="text-lg font-semibold">{profileCopy.heading}</h2>
        <Card className="p-4 rounded-3xl border-border/60 space-y-4">
          {[
            {
              key: "dailyInsights" as const,
              label: "Daily insights",
              description: "Personalized tip delivered at 7:30 AM",
            },
            {
              key: "glucoseAlerts" as const,
              label: "Adaptive glucose alerts",
              description: "Real-time nudges when trends need attention",
            },
            {
              key: "weeklySummary" as const,
              label: "Weekly summary",
              description: "Sunday recap with highlights and opportunities",
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={notifications[key]}
                onCheckedChange={(value) =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: value,
                  }))
                }
              />
            </div>
          ))}
        </Card>
      </section>

      <section className="px-6 space-y-4">
        <h2 className="text-lg font-semibold">{profileCopy.preferencesHeading}</h2>
        <Card className="p-4 rounded-3xl border-border/60 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Time zone</Label>
            <Select
              value={draft.timezone}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  timezone: value,
                }))
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Choose a time zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Los_Angeles">Pacific (Los Angeles)</SelectItem>
                <SelectItem value="America/New_York">Eastern (New York)</SelectItem>
                <SelectItem value="Europe/London">Europe (London)</SelectItem>
                <SelectItem value="Asia/Shanghai">Asia (Shanghai)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred language</Label>
            <Select
              value={draft.language}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  language: value as SupportedLanguage,
                }))
              }
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Español">Español (Spanish)</SelectItem>
                <SelectItem value="中文">中文 (Chinese)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full gradient-primary text-white border-0"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            {profileCopy.save}
          </Button>
        </Card>
      </section>

      <section className="px-6 pb-16 space-y-4">
        <h2 className="text-lg font-semibold">{profileCopy.accountHeading}</h2>
        <Card className="p-4 rounded-3xl border-destructive/30 bg-destructive/5 flex flex-col gap-3">
          <p className="text-sm text-destructive">
            Leaving the beta? You can export your CGM Butler data or deactivate your account at any time. The team would
            love feedback before you go.
          </p>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="w-full">{profileCopy.export}</Button>
            <Button variant="destructive" className="w-full">{profileCopy.deactivate}</Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Profile;
