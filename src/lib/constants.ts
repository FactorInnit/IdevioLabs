import type { NodeCategory } from "./types";

export const WORKFLOW_PHASES = [
  {
    id: "discovery",
    label: "Discovery",
    step: "01",
    description: "Validate problem & market fit",
    categories: ["idea"] as NodeCategory[],
  },
  {
    id: "build",
    label: "Build",
    step: "02",
    description: "Create product & operations",
    categories: ["product", "operations"] as NodeCategory[],
  },
  {
    id: "business",
    label: "Business",
    step: "03",
    description: "Finance, legal & marketing",
    categories: ["finance", "legal", "marketing"] as NodeCategory[],
  },
  {
    id: "scale",
    label: "Scale",
    step: "04",
    description: "Team up & launch",
    categories: ["team", "launch"] as NodeCategory[],
  },
] as const;

export const CATEGORY_CONFIG: Record<
  NodeCategory,
  {
    label: string;
    shortLabel: string;
    order: number;
    phase: string;
    color: string;
    headerBg: string;
    border: string;
    accent: string;
    minimap: string;
  }
> = {
  idea: {
    label: "Idea & Validation",
    shortLabel: "Idea",
    order: 1,
    phase: "discovery",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-500",
    minimap: "#3b5998",
  },
  product: {
    label: "Product / MVP",
    shortLabel: "Product",
    order: 2,
    phase: "build",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-400",
    minimap: "#5a7ab8",
  },
  marketing: {
    label: "Marketing",
    shortLabel: "Marketing",
    order: 5,
    phase: "business",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-500",
    minimap: "#2d4a7a",
  },
  finance: {
    label: "Finance",
    shortLabel: "Finance",
    order: 3,
    phase: "business",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-600",
    minimap: "#1a365d",
  },
  legal: {
    label: "Legal & Compliance",
    shortLabel: "Legal",
    order: 4,
    phase: "business",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-500",
    minimap: "#0f2444",
  },
  operations: {
    label: "Operations",
    shortLabel: "Ops",
    order: 6,
    phase: "build",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-400",
    minimap: "#5a7ab8",
  },
  team: {
    label: "Team & Hiring",
    shortLabel: "Team",
    order: 7,
    phase: "scale",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-navy-500",
    minimap: "#3b5998",
  },
  launch: {
    label: "Launch & Growth",
    shortLabel: "Launch",
    order: 8,
    phase: "scale",
    color: "text-white",
    headerBg: "bg-navy-800",
    border: "border-navy-600/50",
    accent: "bg-white",
    minimap: "#ffffff",
  },
};

export const GRID_COL_WIDTH = 320;
export const GRID_ROW_HEIGHT = 250;
export const GRID_ORIGIN = { x: 40, y: 40 };
export const GRID_COLUMNS = 3;

export const DEFAULT_NODE_LAYOUT: Record<
  NodeCategory,
  { x: number; y: number }
> = {
  idea: { x: 40, y: 40 },
  product: { x: 360, y: 40 },
  marketing: { x: 680, y: 40 },
  finance: { x: 40, y: 290 },
  legal: { x: 360, y: 290 },
  operations: { x: 680, y: 290 },
  team: { x: 40, y: 540 },
  launch: { x: 360, y: 540 },
};

/** Neat grid position for an item at a given ordering index. */
export function gridPosition(index: number): { x: number; y: number } {
  const col = index % GRID_COLUMNS;
  const row = Math.floor(index / GRID_COLUMNS);
  return {
    x: GRID_ORIGIN.x + col * GRID_COL_WIDTH,
    y: GRID_ORIGIN.y + row * GRID_ROW_HEIGHT,
  };
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getPhaseForCategory(category: NodeCategory) {
  return WORKFLOW_PHASES.find((p) => p.categories.includes(category));
}
