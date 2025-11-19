import { useCallback, useEffect, type KeyboardEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";

const Landing = () => {
  const navigate = useNavigate();

  // Check if user has already seen the welcome page
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome === "true") {
      // User has seen welcome before, redirect to overview
      navigate("/overview", { replace: true });
    }
  }, [navigate]);

  const handleEnter = useCallback(() => {
    // Mark welcome as seen and navigate to overview
    localStorage.setItem("hasSeenWelcome", "true");
    navigate("/overview");
  }, [navigate]);

  const shouldSkipNavigation = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return Boolean(target.closest("[data-landing-actions]"));
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (shouldSkipNavigation(event.target)) {
        return;
      }
      handleEnter();
    },
    [handleEnter, shouldSkipNavigation],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (shouldSkipNavigation(event.target)) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleEnter();
      }
    },
    [handleEnter, shouldSkipNavigation],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="min-h-full cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 flex flex-col justify-between"
    >
      <Hero />
      <div className="px-6 pb-14 text-center text-sm text-muted-foreground">
        Tap anywhere to view today&apos;s overview.
      </div>
    </div>
  );
};

export default Landing;
