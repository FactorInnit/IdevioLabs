"use client";

import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import { companyModuleHref } from "@/lib/founder-nav";

interface AICoachFabProps {
  companyId: string;
}

export function AICoachFab({ companyId }: AICoachFabProps) {
  return (
    <Link
      href={companyModuleHref(companyId, "chat")}
      className="founder-float fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-2xl bg-navy-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-navy-900/30 transition hover:bg-navy-800 hover:shadow-navy-900/40"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
        <Bot className="h-4 w-4" />
        <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-navy-300" />
      </span>
      AI Founder Coach
    </Link>
  );
}
