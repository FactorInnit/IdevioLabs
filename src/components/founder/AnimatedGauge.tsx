"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGaugeProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function AnimatedGauge({
  value,
  max = 100,
  size = 160,
  stroke = 10,
  label,
  sublabel,
  className,
}: AnimatedGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (animated / max) * 100));
  const offset = circumference - (pct / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="founder-glow-pulse rounded-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(8,26,58,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-ring transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#081a3a" />
            <stop offset="100%" stopColor="#4a78b4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-navy-900">
          {Math.round(animated)}
        </span>
        {max !== 100 && (
          <span className="text-xs text-slate-400">/{max}</span>
        )}
      </div>
      {label && (
        <p className="mt-3 text-sm font-semibold text-navy-900">{label}</p>
      )}
      {sublabel && (
        <p className="text-xs text-slate-500">{sublabel}</p>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  delay?: number;
}

export function ScoreBar({ label, value, delay = 0 }: ScoreBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-navy-800">{label}</span>
        <span className="tabular-nums text-slate-500">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-navy-900/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-400 transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
