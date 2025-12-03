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
import { getStoredUserId, USER_ID_CHANGE_EVENT } from "@/utils/userUtils";
import { getAgentConfig } from "@/config/agentConfig";

interface MobileAppShellProps {
  children: ReactNode;
  className?: string;
}

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
  const [agentName, setAgentName] = useState<string>("Olivia");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user's agent preference
  useEffect(() => {
    const fetchAgentPreference = async () => {
      try {
        const userId = getStoredUserId();
        // Use relative URL in dev mode to leverage Vite proxy for mobile network access
        const backendUrl = import.meta.env.DEV
          ? ""
          : (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
        const response = await fetch(`${backendUrl}/api/user/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          const agentConfig = getAgentConfig(userData.agent_preference);
          setAgentName(agentConfig.displayName);
        }
      } catch (error) {
        console.error("Failed to fetch agent preference:", error);
        // Keep default "Olivia"
      }
    };

    fetchAgentPreference();

    // Listen for user ID changes
    const handleUserChange = () => {
      fetchAgentPreference();
    };
    window.addEventListener(USER_ID_CHANGE_EVENT, handleUserChange);

    // Listen for agent preference changes
    const handleAgentPreferenceChange = (event: any) => {
      const agentConfig = getAgentConfig(event.detail?.agentPreference);
      setAgentName(agentConfig.displayName);
    };
    window.addEventListener('agentPreferenceChanged', handleAgentPreferenceChange);

    return () => {
      window.removeEventListener(USER_ID_CHANGE_EVENT, handleUserChange);
      window.removeEventListener('agentPreferenceChanged', handleAgentPreferenceChange);
    };
  }, []);

  const navItems = [
    { label: "My CGM", icon: LineChart, path: "/overview" },
    { label: agentName, icon: MessageCircle, path: "/coach" },
    { label: "My Goals", icon: Target, path: "/goal" },
    { label: "Community", icon: Users, path: "/community" },
    { label: "Profile", icon: CircleUserRound, path: "/profile" },
  ];

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
