"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlanId } from "@/lib/plans";
import { isBetaPaymentsDisabled } from "@/lib/beta";
import { BetaUpgradeInterestModal } from "@/components/BetaUpgradeInterestModal";
import { cn } from "@/lib/utils";

interface BetaUpgradeLinkProps {
  planId?: PlanId;
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/** Links to /pricing when live; opens upgrade-interest modal during beta. */
export function BetaUpgradeLink({
  planId = "pro",
  href = "/pricing",
  className,
  children,
  onClick,
}: BetaUpgradeLinkProps) {
  const [open, setOpen] = useState(false);
  const beta = isBetaPaymentsDisabled();

  if (!beta) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(className)}
        onClick={() => {
          onClick?.();
          setOpen(true);
        }}
      >
        {children}
      </button>
      <BetaUpgradeInterestModal
        open={open}
        onClose={() => setOpen(false)}
        planId={planId}
      />
    </>
  );
}
