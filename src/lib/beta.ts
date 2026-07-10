/** When true, Pro/Ultra checkout is disabled and we collect upgrade interest instead. */
export function isBetaPaymentsDisabled(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_BETA_PAYMENTS_DISABLED ??
    process.env.BETA_PAYMENTS_DISABLED;
  return flag !== "false";
}

export const BETA_LABEL = "Public beta";

export const BETA_DISCLAIMER =
  "Idevio is in public beta — this is not the final app. Features, pricing, and design will change before full launch.";

export const BETA_JOIN_STEPS =
  "Create a free account, then describe your startup to generate your first roadmap.";
