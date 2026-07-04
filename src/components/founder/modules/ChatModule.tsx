"use client";

import { AssistantPanel, type AssistantContext } from "@/components/AssistantPanel";
import { GlassCard } from "@/components/founder/GlassCard";

export function ChatModule({
  context,
  onProjectChange,
  userPlan,
}: {
  context: AssistantContext;
  onProjectChange?: () => void | Promise<void>;
  userPlan?: string;
}) {
  const strategyMode = userPlan === "ultra";

  return (
    <GlassCard className="overflow-hidden p-0" hover={false}>
      <div className="h-[min(72vh,720px)]">
        <AssistantPanel
          context={context}
          onProjectChange={onProjectChange}
          strategyMode={strategyMode}
        />
      </div>
    </GlassCard>
  );
}
