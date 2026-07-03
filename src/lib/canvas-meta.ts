export const BLOCK_COLORS = [
  { id: "navy", bg: "#081a3a", light: "#e8edf5" },
  { id: "blue", bg: "#2563eb", light: "#dbeafe" },
  { id: "emerald", bg: "#059669", light: "#d1fae5" },
  { id: "violet", bg: "#7c3aed", light: "#ede9fe" },
  { id: "orange", bg: "#ea580c", light: "#ffedd5" },
  { id: "rose", bg: "#e11d48", light: "#ffe4e6" },
  { id: "amber", bg: "#d97706", light: "#fef3c7" },
  { id: "slate", bg: "#475569", light: "#f1f5f9" },
] as const;

export type BlockColorId = (typeof BLOCK_COLORS)[number]["id"];

export interface CanvasMeta {
  colors: Record<string, BlockColorId>;
  comments: Record<string, string>;
  sectionOrder: Record<string, string[]>;
}

function key(projectId: string) {
  return `idevio-canvas-meta-${projectId}`;
}

export function loadCanvasMeta(projectId: string): CanvasMeta {
  try {
    const raw = localStorage.getItem(key(projectId));
    if (raw) return JSON.parse(raw) as CanvasMeta;
  } catch {
    // ignore
  }
  return { colors: {}, comments: {}, sectionOrder: {} };
}

export function saveCanvasMeta(projectId: string, meta: CanvasMeta) {
  localStorage.setItem(key(projectId), JSON.stringify(meta));
}

export function getBlockColor(colorId?: BlockColorId) {
  return BLOCK_COLORS.find((c) => c.id === colorId) ?? BLOCK_COLORS[0];
}
