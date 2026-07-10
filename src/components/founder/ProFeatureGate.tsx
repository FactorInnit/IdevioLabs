"use client";

import { Sparkles } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { BetaUpgradeLink } from "@/components/BetaUpgradeLink";
import { canAccessProFeature } from "@/lib/plan-access";
import { isBetaPaymentsDisabled } from "@/lib/beta";

export function ProFeatureGate({
  planId,
  title,
  description,
  children,
}: {
  planId: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  if (canAccessProFeature(planId)) {
    return <>{children}</>;
  }

  const beta = isBetaPaymentsDisabled();

  return (
    <GlassCard className="flex flex-col items-center py-16 text-center" hover={false}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900/10">
        <Sparkles className="h-7 w-7 text-navy-700" />
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {beta ? "Pro feature · Beta" : "Pro feature"}
      </p>
      <h2 className="mt-2 font-display text-xl font-bold text-navy-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {beta
          ? `${description} This feature is still in development — register your interest for early access when Pro launches.`
          : description}
      </p>
      <BetaUpgradeLink
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
      >
        <Sparkles className="h-4 w-4" />
        {beta ? "Register interest in Pro" : "Upgrade to Pro"}
      </BetaUpgradeLink>
    </GlassCard>
  );
}
