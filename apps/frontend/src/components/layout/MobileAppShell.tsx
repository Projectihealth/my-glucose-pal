import { ReactNode, useEffect, useState } from "react";
import {
  BatteryFull,
  CircleUserRound,
  LayoutGrid,
  LineChart,
  MessageCircle,
  Signal,
  Target,
  Users,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_DIALOG_PORTAL_ID } from "@/lib/dom";

interface MobileAppShellProps {
  children: ReactNode;
  className?: string;
}

const navItems = [
  { label: "My CGM", icon: LineChart, path: "/overview" },
  { label: "Olivia", icon: MessageCircle, path: "/coach" },
  { label: "My Goals", icon: Target, path: "/goal" },
  { label: "Community", icon: Users, path: "/community" },
  { label: "Profile", icon: CircleUserRound, path: "/profile" },
];

const formatTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

export const MobileAppShell = ({ children, className }: MobileAppShellProps) => {
  const [time, setTime] = useState<string>(formatTime());
  const [isBetaMode, setIsBetaMode] = useState<boolean>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('betaMode');
    return stored === 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const toggleBetaMode = () => {
    const newBetaMode = !isBetaMode;
    setIsBetaMode(newBetaMode);
    localStorage.setItem('betaMode', String(newBetaMode));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('betaModeChange'));

    // If currently on learn-more page, navigate to trigger re-render
    if (location.pathname.startsWith('/learn-more')) {
      navigate('/learn-more', { replace: true });
    }
  };

  const handleNavClick = (item: (typeof navItems)[number]) => {
    if (item.path) {
      if (location.pathname === item.path) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate(item.path);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950">
      <div id={APP_DIALOG_PORTAL_ID} className="relative w-full">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 pt-4 pb-3 text-[13px] font-semibold text-slate-500 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span>{time}</span>
            <button
              onClick={toggleBetaMode}
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider transition-all",
                isBetaMode
                  ? "bg-gradient-to-r from-[#4FC3F7] to-[#4A6FE3] text-white shadow-sm"
                  : "bg-slate-200 text-slate-500 hover:bg-slate-300"
              )}
              title={isBetaMode ? "Beta Mode: ON (Click to disable)" : "Beta Mode: OFF (Click to enable)"}
            >
              BETA
            </button>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <BatteryFull className="w-4 h-4" />
          </div>
        </header>

        <main className={cn("pb-20 relative", className)}>
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/95 backdrop-blur border-t border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-5 px-4 py-3 text-[11px] font-medium text-slate-500">
            {navItems.map((item) => {
              const { label, icon: Icon, path } = item;
              const isActive = path ? location.pathname === path || location.pathname.startsWith(`${path}/`) : false;

              return (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive ? "text-primary" : undefined,
                )}
                onClick={() => handleNavClick(item)}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileAppShell;
