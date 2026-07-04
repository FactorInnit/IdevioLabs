"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  hover?: boolean;
  solid?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  dark,
  hover = true,
  solid = false,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl",
        dark
          ? "glass-card-dark text-white"
          : solid
            ? "border border-navy-900/10 bg-white shadow-2xl dark:bg-[#0f1829]"
            : hover
              ? "glass-card"
              : "border border-white/40 bg-white/60 dark:border-white/10 dark:bg-[#0f1829]/80",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
