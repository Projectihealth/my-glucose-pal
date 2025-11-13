import { ReactNode, useEffect, useState } from "react";
import {
  BatteryFull,
  CircleUserRound,
  LayoutGrid,
  LineChart,
  MessageCircle,
  Signal,
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
  { label: "Community", icon: Users, path: "/community" },
  { label: "Learn More", icon: LayoutGrid, path: "/learn-more" },
  { label: "Profile", icon: CircleUserRound, path: "/profile" },
];

const formatTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

export const MobileAppShell = ({ children, className }: MobileAppShellProps) => {
  const [time, setTime] = useState<string>(formatTime());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-200/70 to-slate-300 dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center p-4 md:p-10 overflow-hidden">
      <div
        id={APP_DIALOG_PORTAL_ID}
        className="relative w-full max-w-[420px] rounded-[36px] bg-white dark:bg-slate-950 shadow-[0_40px_120px_rgba(15,23,42,0.28)] border border-white/60 dark:border-slate-800 overflow-hidden flex flex-col"
        style={{ height: "min(812px, calc(100vh - 2rem))" }}
      >
        <div className="absolute inset-x-16 top-0 h-7 rounded-b-[20px] bg-slate-900/90 dark:bg-slate-700/70" aria-hidden="true" />

        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between px-7 pt-6 pb-4 text-[13px] font-semibold text-slate-500">
            <span>{time}</span>
            <div className="flex items-center gap-1 text-slate-500">
              <Signal className="w-4 h-4" />
              <Wifi className="w-4 h-4" />
              <BatteryFull className="w-4 h-4" />
            </div>
          </header>

          <main className={cn("flex-1 overflow-y-auto pb-28", className)}>
            {children}
          </main>

          <nav className="sticky bottom-0 bg-white/90 dark:bg-slate-950/95 backdrop-blur border-t border-slate-200/80 dark:border-slate-800">
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
    </div>
  );
};

export default MobileAppShell;
