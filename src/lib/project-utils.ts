import type { ToolRecommendation, TaskStep } from "@/lib/types";

export function parseNodeTools(raw: string): ToolRecommendation[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseNodeTasks(raw: string): TaskStep[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function collectProjectTools(
  nodes: { tools: string; title: string; category: string }[]
) {
  const seen = new Set<string>();
  const tools: (ToolRecommendation & { block: string; category: string })[] = [];

  for (const node of nodes) {
    for (const tool of parseNodeTools(node.tools)) {
      const key = tool.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tools.push({ ...tool, block: node.title, category: node.category });
    }
  }
  return tools;
}

export function totalEstimatedCost(
  nodes: { estimatedCost: number | null }[]
): number {
  return nodes.reduce((s, n) => s + (n.estimatedCost ?? 0), 0);
}
