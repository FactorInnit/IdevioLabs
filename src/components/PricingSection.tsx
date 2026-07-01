"use client";

import { useState } from "react";
import { Check, Minus, Sparkles, Star } from "lucide-react";
import { PLANS, PLAN_COMPARISON, formatPlanPrice, type PlanId } from "@/lib/plans";
import { usePlan } from "@/lib/usePlan";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  compact?: boolean;
  onSelected?: (id: PlanId) => void;
  showComparison?: boolean;
}

export function PricingSection({
  compact,
  onSelected,
  showComparison = !compact,
}: PricingSectionProps) {
  const { planId, checkoutPlan } = usePlan();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const handleSelect = async (id: PlanId) => {
    setError("");
    if (id === planId) return;

    if (id === "free") {
      setError("Contact support to downgrade. Paid plans are managed via Stripe.");
      return;
    }

    setLoadingPlan(id);
    const result = await checkoutPlan(id);
    setLoadingPlan(null);

    if (result.error && !result.url) {
      setError(result.error);
    } else {
      onSelected?.(id);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "grid gap-6",
          compact ? "md:grid-cols-2" : "lg:grid-cols-3"
        )}
      >
        {PLANS.filter((p) => (compact ? p.id !== "free" : true)).map((plan) => {
          const isCurrent = plan.id === planId;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition",
                plan.highlight
                  ? "border-navy-700 bg-navy-950 text-white shadow-2xl shadow-navy-900/30"
                  : "border-slate-200 bg-white text-navy-950"
              )}
            >
              {plan.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide",
                    plan.highlight
                      ? "bg-white text-navy-900"
                      : "bg-navy-900 text-white"
                  )}
                >
                  {plan.highlight ? (
                    <Star className="h-3 w-3 fill-navy-900 text-navy-900" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    plan.highlight ? "text-white/60" : "text-slate-500"
                  )}
                >
                  {plan.tagline}
                </p>
              </div>

              <div className="mt-5 flex items-end gap-2">
                {plan.oldPrice && (
                  <span
                    className={cn(
                      "mb-1 text-lg font-medium line-through",
                      plan.highlight ? "text-white/40" : "text-slate-300"
                    )}
                  >
                    {formatPlanPrice(plan.oldPrice)}
                  </span>
                )}
                <span className="text-4xl font-bold tracking-tight">
                  {formatPlanPrice(plan.price)}
                </span>
                <span
                  className={cn(
                    "mb-1 text-sm",
                    plan.highlight ? "text-white/50" : "text-slate-400"
                  )}
                >
                  /{plan.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.highlight ? "text-white" : "text-navy-600"
                      )}
                    />
                    <span
                      className={plan.highlight ? "text-white/80" : "text-slate-600"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.notIncluded?.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm opacity-60"
                  >
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={isCurrent || isLoading || plan.id === "free"}
                className={cn(
                  "mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                  isCurrent || plan.id === "free"
                    ? plan.highlight
                      ? "cursor-default bg-white/10 text-white/60"
                      : "cursor-default bg-slate-100 text-slate-400"
                    : plan.highlight
                      ? "bg-white text-navy-900 hover:bg-white/90"
                      : "bg-navy-900 text-white hover:bg-navy-800",
                  isLoading && "opacity-70"
                )}
              >
                {isCurrent
                  ? "Current plan"
                  : isLoading
                    ? "Redirecting to checkout…"
                    : plan.id === "free"
                      ? "Included"
                      : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}

      {showComparison && (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-navy-950">Feature</th>
                <th className="px-4 py-3 font-semibold text-navy-950">Free</th>
                <th className="px-4 py-3 font-semibold text-navy-950">Pro</th>
                <th className="px-4 py-3 font-semibold text-navy-950">Ultra</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy-900">{row.label}</td>
                  <td className="px-4 py-3 text-slate-600">{row.free}</td>
                  <td className="px-4 py-3 text-slate-600">{row.pro}</td>
                  <td className="px-4 py-3 text-slate-600">{row.ultra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">
        Pro and Ultra upgrades are processed securely via Stripe. Your plan updates
        automatically after payment.
      </p>
    </div>
  );
}
