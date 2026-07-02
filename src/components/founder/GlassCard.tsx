"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  dark,
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl",
        dark ? "glass-card-dark text-white" : hover ? "glass-card" : "border border-white/40 bg-white/60",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
