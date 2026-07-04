"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  value: number;
  fillColor?: string;
  trackClassName?: string;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
  durationMs?: number;
}

export function AnimatedProgressBar({
  value,
  fillColor = "#081a3a",
  trackClassName,
  className,
  showLabel = false,
  labelClassName,
  durationMs = 700,
}: AnimatedProgressBarProps) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(Math.min(100, Math.max(0, value)));
  }, [value]);

  const pct = Math.min(100, Math.max(0, display));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className={cn("mb-1 flex justify-between text-[10px] font-semibold", labelClassName)}>
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          "h-2 overflow-hidden rounded-full bg-white/80",
          trackClassName
        )}
      >
        <div
          className="h-full rounded-full transition-[width] ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: fillColor,
            transitionDuration: `${durationMs}ms`,
          }}
        />
      </div>
    </div>
  );
}

interface MilestoneToastProps {
  message: string | null;
  onDone?: () => void;
}

export function MilestoneToast({ message, onDone }: MilestoneToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onDone?.(), 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2">
      <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-white px-5 py-3 shadow-2xl shadow-amber-900/10">
        <p className="text-sm font-semibold text-navy-900">{message}</p>
      </div>
    </div>
  );
}
