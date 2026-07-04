"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
  variant?: "default" | "sidebar" | "header";
}

export function ThemeToggle({
  className,
  compact = false,
  variant = "default",
}: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition",
        variant === "header" &&
          "h-9 w-9 text-white/70 hover:bg-white/10 hover:text-white",
        variant === "sidebar" &&
          "gap-2 px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100",
        variant === "default" &&
          "h-9 w-9 border border-navy-900/10 bg-white text-navy-800 shadow-sm hover:bg-navy-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className={cn("shrink-0", compact ? "h-4 w-4" : "h-4 w-4")} />
        ) : (
          <Moon className={cn("shrink-0", compact ? "h-4 w-4" : "h-4 w-4")} />
        )
      ) : (
        <Moon className="h-4 w-4 shrink-0 opacity-50" />
      )}
      {variant === "sidebar" && !compact && (
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  );
}
