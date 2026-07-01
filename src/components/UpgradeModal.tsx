"use client";

import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import { PricingSection } from "./PricingSection";
import type { PlanId } from "@/lib/plans";

interface UpgradeModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onUpgraded?: (id: PlanId) => void;
}

export function UpgradeModal({
  open,
  title = "Upgrade to unlock more",
  description = "You've reached the limit of the Free plan. Choose a plan to keep building.",
  onClose,
  onUpgraded,
}: UpgradeModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative border-b border-slate-100 bg-navy-950 px-6 py-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Lock className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-sm text-white/60">{description}</p>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <PricingSection compact showComparison={false} onSelected={onUpgraded} />
          <p className="mt-4 text-center text-xs text-slate-400">
            You&apos;ll be redirected to Stripe to complete payment. Your plan
            upgrades only after payment succeeds.
          </p>
        </div>
      </div>
    </div>
  );
}
