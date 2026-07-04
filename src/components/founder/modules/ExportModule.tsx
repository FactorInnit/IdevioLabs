"use client";

import { FileDown } from "lucide-react";
import { GlassCard } from "../GlassCard";
import {
  buildPitchOnePagerHtml,
  buildProgressReportHtml,
  type ExportProjectData,
} from "@/lib/export-html";
import type { CompanyProject } from "../CompanyWorkspace";

function toExportData(project: CompanyProject): ExportProjectData {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    progress: project.progress,
    budget: project.budget,
    updatedAt: project.updatedAt,
    nodes: project.nodes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      category: n.category,
      progress: n.progress,
      status: n.status,
    })),
  };
}

function printHtml(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
  };
}

export function ExportModule({ project }: { project: CompanyProject }) {
  const exportData = toExportData(project);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/10">
            <FileDown className="h-5 w-5 text-navy-700" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Documents
            </p>
            <h2 className="font-display text-xl font-bold text-navy-900">Export & print</h2>
          </div>
        </div>
        <p className="mt-4 max-w-xl text-sm text-slate-500">
          Generate styled PDFs from your live project data. Opens a print dialog — choose
          &quot;Save as PDF&quot; in your browser.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => printHtml(buildProgressReportHtml(exportData))}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            <FileDown className="h-4 w-4" />
            Export progress PDF
          </button>
          <button
            type="button"
            onClick={() => printHtml(buildPitchOnePagerHtml(exportData))}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-900/15 bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-navy-900/5"
          >
            <FileDown className="h-4 w-4" />
            Export pitch one-pager PDF
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
