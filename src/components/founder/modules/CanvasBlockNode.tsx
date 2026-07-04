"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GripVertical } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { NodeCategory } from "@/lib/types";

export interface CanvasBlockNodeData {
  title: string;
  description: string;
  progress: number;
  category: NodeCategory;
  taskCount: number;
  borderColor: string;
  bgColor: string;
  step: number;
  hasNote?: boolean;
}

function CanvasBlockNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as CanvasBlockNodeData;
  const cat = CATEGORY_CONFIG[d.category];

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-2.5 !w-2.5 !border-navy-400 !bg-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-2.5 !w-2.5 !border-navy-400 !bg-white"
      />
      <div
        className={`min-w-[220px] max-w-[260px] rounded-2xl border-2 p-4 shadow-lg transition ${
          selected ? "ring-2 ring-navy-700 ring-offset-2" : ""
        }`}
        style={{ borderColor: d.borderColor, backgroundColor: d.bgColor }}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                style={{ backgroundColor: cat?.minimap ?? d.borderColor }}
              >
                {d.step}
              </span>
              <span className="text-[9px] font-bold uppercase text-navy-500">
                {cat?.shortLabel}
              </span>
            </div>
            <p className="mt-1 font-display text-sm font-bold leading-snug text-navy-900">
              {d.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
              {d.description}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] font-semibold text-navy-700">
                <span>Progress</span>
                <span>{d.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.progress}%`, backgroundColor: d.borderColor }}
                />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              {d.taskCount} tasks{d.hasNote ? " · note" : ""}
            </p>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-2.5 !w-2.5 !border-navy-400 !bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-2.5 !w-2.5 !border-navy-400 !bg-white"
      />
    </>
  );
}

export const CanvasBlockNode = memo(CanvasBlockNodeComponent);
