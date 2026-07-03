"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, ListOrdered } from "lucide-react";
import { GlassCard } from "../GlassCard";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { parseNodeTasks } from "@/lib/project-utils";
import { formatCurrency } from "@/lib/utils";
import type { NodeCategory } from "@/lib/types";
import type { CompanyProject } from "../CompanyWorkspace";

const CATEGORY_ORDER: NodeCategory[] = [
  "idea",
  "product",
  "finance",
  "legal",
  "marketing",
  "operations",
  "team",
  "launch",
];

export function SectionWorkspace({ project }: { project: CompanyProject }) {
  const sections = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => {
      const config = CATEGORY_CONFIG[cat];
      const nodes = project.nodes.filter((n) => n.category === cat);
      return { cat, config, nodes };
    }).filter((s) => s.nodes.length > 0);
  }, [project.nodes]);

  const emptyCategories = CATEGORY_ORDER.filter(
    (cat) => !project.nodes.some((n) => n.category === cat)
  );

  return (
    <div className="space-y-8">
      <GlassCard className="p-5" hover={false}>
        <p className="text-sm text-slate-600">
          Your startup broken down by <strong className="text-navy-900">business section</strong>.
          Each block lists ordered tasks — work top to bottom within each section.
        </p>
      </GlassCard>

      {sections.map(({ cat, config, nodes }) => (
        <section key={cat}>
          <div className="mb-4 flex items-center gap-3">
            <div
              className="h-10 w-1.5 rounded-full"
              style={{ backgroundColor: config.minimap }}
            />
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900">
                {config.label}
              </h2>
              <p className="text-xs text-slate-500">
                {nodes.length} block{nodes.length !== 1 ? "s" : ""} · Phase: {config.phase}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {nodes.map((node) => {
              const tasks = parseNodeTasks(node.tasks);
              return (
                <GlassCard key={node.id} className="overflow-hidden p-0" hover={false}>
                  <div className="border-b border-navy-900/6 bg-navy-950/5 px-6 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-navy-900">
                          {node.title}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                          {node.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-navy-900/8 px-3 py-1 font-semibold text-navy-800">
                          {node.progress}% done
                        </span>
                        {node.estimatedCost != null && node.estimatedCost > 0 && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                            {formatCurrency(node.estimatedCost)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-900/8">
                      <div
                        className="h-full rounded-full bg-navy-700 transition-all"
                        style={{ width: `${node.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <ListOrdered className="h-4 w-4" />
                      Ordered tasks
                    </div>
                    {tasks.length === 0 ? (
                      <p className="text-sm text-slate-400">No tasks defined yet.</p>
                    ) : (
                      <ol className="space-y-3">
                        {tasks.map((task, i) => (
                          <li
                            key={i}
                            className="flex gap-4 rounded-xl border border-navy-900/6 bg-white/80 p-4"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-navy-900">{task.title}</p>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                {task.detail}
                              </p>
                              {task.tools?.length > 0 && (
                                <p className="mt-2 text-xs text-navy-700">
                                  <span className="font-semibold">Tools:</span>{" "}
                                  {task.tools.join(" · ")}
                                </p>
                              )}
                              {task.estimatedTime && (
                                <p className="mt-1 text-[10px] text-slate-400">
                                  ~{task.estimatedTime}
                                </p>
                              )}
                            </div>
                            {node.progress >= ((i + 1) / tasks.length) * 100 ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>
      ))}

      {emptyCategories.length > 0 && (
        <GlassCard className="border-dashed p-6" hover={false}>
          <p className="text-sm text-slate-500">
            Sections not yet in your roadmap:{" "}
            {emptyCategories.map((c) => CATEGORY_CONFIG[c].label).join(", ")}.
            Add blocks in the <strong>Roadmap</strong> tab.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
