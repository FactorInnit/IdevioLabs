"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import type { ProgressLogData } from "@/lib/types";

interface ProgressTimelineProps {
  logs: ProgressLogData[];
  overallProgress: number;
}

export function ProgressTimeline({ logs, overallProgress }: ProgressTimelineProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-navy-950">Activity log</h3>
            <p className="text-xs text-slate-500">Recent progress updates</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-navy-900">{overallProgress}%</span>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-navy-800 transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="max-h-52 space-y-3 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500">
            No activity yet. Update a workflow block to start tracking.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p className="text-sm text-navy-900">{log.note}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
