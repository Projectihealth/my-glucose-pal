import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
  leadingContent?: ReactNode;
  disableHorizontalPadding?: boolean;
}

export function TabHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  children,
  leadingContent,
  disableHorizontalPadding = false,
}: TabHeaderProps) {
  const paddingClasses = disableHorizontalPadding
    ? "pt-8 pb-6"
    : "px-6 pt-8 pb-6";

  return (
    <div
      className={cn(
        "space-y-3",
        paddingClasses,
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {leadingContent && (
        <div className={align === "center" ? "flex justify-center" : undefined}>
          {leadingContent}
        </div>
      )}
      {eyebrow && (
        <p className="text-[#5B7FF3] text-[11px] font-semibold tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
      )}
      <div>
        <h1 className="text-gray-900 text-[32px] leading-tight font-bold">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-[15px] leading-relaxed mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
