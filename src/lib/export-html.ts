import { CATEGORY_CONFIG } from "@/lib/constants";
import type { NodeCategory } from "@/lib/types";

export interface ExportNode {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  status: string;
}

export interface ExportProjectData {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string | Date;
  nodes: ExportNode[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatBudget(budget: number | null): string {
  if (budget == null) return "Not set";
  if (budget >= 1_000_000) return `$${(budget / 1_000_000).toFixed(1)}M`;
  if (budget >= 1_000) return `$${Math.round(budget / 1_000)}K`;
  return `$${budget.toLocaleString()}`;
}

function categoryLabel(category: string): string {
  const key = category as NodeCategory;
  return CATEGORY_CONFIG[key]?.label ?? category;
}

function baseStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #081a3a;
      background: #fff;
      line-height: 1.5;
      padding: 48px;
    }
    .header {
      border-bottom: 3px solid #081a3a;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .eyebrow {
      font-family: system-ui, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #081a3a;
      margin-bottom: 8px;
    }
    .subtitle { color: #475569; font-size: 14px; max-width: 640px; }
    .meta {
      margin-top: 16px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      color: #64748b;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background: #f8fafc;
    }
    .stat-label {
      font-family: system-ui, sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #64748b;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #081a3a;
      margin-top: 4px;
    }
    h2 {
      font-size: 18px;
      margin: 28px 0 12px;
      color: #081a3a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: system-ui, sans-serif;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #081a3a;
      color: #fff;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    .progress-fill {
      height: 100%;
      background: #059669;
      border-radius: 4px;
    }
    .footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 24px; }
      .stat-grid { break-inside: avoid; }
    }
  `;
}

export function buildProgressReportHtml(project: ExportProjectData): string {
  const completed = project.nodes.filter((n) => n.progress >= 100).length;
  const inProgress = project.nodes.filter((n) => n.progress > 0 && n.progress < 100);
  const avgProgress =
    project.nodes.length > 0
      ? Math.round(project.nodes.reduce((s, n) => s + n.progress, 0) / project.nodes.length)
      : 0;

  const nodeRows = project.nodes
    .map((node) => {
      const desc = node.description
        ? `<div style="font-size:11px;color:#64748b;margin-top:4px">${escapeHtml(node.description.slice(0, 120))}${node.description.length > 120 ? "…" : ""}</div>`
        : "";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(node.title)}</strong>
            ${desc}
          </td>
          <td>${escapeHtml(categoryLabel(node.category))}</td>
          <td>${node.progress}%</td>
          <td>${escapeHtml(node.status.replace(/_/g, " "))}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(project.name)} — Progress Report</title>
  <style>${baseStyles()}</style>
</head>
<body>
  <div class="header">
    <div class="eyebrow">Progress Report</div>
    <h1>${escapeHtml(project.name)}</h1>
    ${project.description ? `<p class="subtitle">${escapeHtml(project.description)}</p>` : ""}
    <div class="meta">Generated ${formatDate(new Date())} · Last updated ${formatDate(project.updatedAt)}</div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="stat-label">Overall progress</div>
      <div class="stat-value">${project.progress}%</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${project.progress}%"></div></div>
    </div>
    <div class="stat">
      <div class="stat-label">Milestones complete</div>
      <div class="stat-value">${completed}/${project.nodes.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Budget</div>
      <div class="stat-value">${formatBudget(project.budget)}</div>
    </div>
  </div>

  <h2>Execution summary</h2>
  <p style="font-size:14px;color:#475569;margin-bottom:16px">
    Average node progress: ${avgProgress}%.
    ${inProgress.length > 0 ? `${inProgress.length} milestone${inProgress.length === 1 ? "" : "s"} actively in progress.` : "No milestones currently in progress."}
  </p>

  <h2>Roadmap milestones</h2>
  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th>Category</th>
        <th>Progress</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${nodeRows || `<tr><td colspan="4">No milestones defined yet.</td></tr>`}
    </tbody>
  </table>

  <div class="footer">Exported from Idevio · ${escapeHtml(project.name)}</div>
</body>
</html>`;
}

export function buildPitchOnePagerHtml(project: ExportProjectData): string {
  const completed = project.nodes.filter((n) => n.progress >= 100);
  const topNodes = [...project.nodes]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const highlights = topNodes
    .map(
      (n) =>
        `<li><strong>${escapeHtml(n.title)}</strong> — ${n.progress}% complete (${escapeHtml(categoryLabel(n.category))})</li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(project.name)} — One-Pager</title>
  <style>
    ${baseStyles()}
    .hero {
      background: linear-gradient(135deg, #081a3a 0%, #1e3a5f 100%);
      color: #fff;
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 32px;
    }
    .hero h1 { color: #fff; font-size: 36px; }
    .hero .subtitle { color: rgba(255,255,255,0.85); font-size: 16px; }
    .hero .tagline {
      margin-top: 20px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #93c5fd;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 8px;
    }
    ul { padding-left: 20px; font-size: 14px; color: #334155; }
    li { margin-bottom: 8px; }
    .callout {
      border-left: 4px solid #081a3a;
      padding: 16px 20px;
      background: #f8fafc;
      font-size: 14px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="tagline">Startup One-Pager</div>
    <h1>${escapeHtml(project.name)}</h1>
    <p class="subtitle">${escapeHtml(project.description ?? "Building the future — one milestone at a time.")}</p>
  </div>

  <div class="two-col">
    <div>
      <h2>The opportunity</h2>
      <div class="callout">
        ${escapeHtml(project.description ?? `${project.name} is executing across ${project.nodes.length} strategic milestones with ${project.progress}% overall progress.`)}
      </div>
    </div>
    <div>
      <h2>Key metrics</h2>
      <ul>
        <li><strong>Progress:</strong> ${project.progress}% overall</li>
        <li><strong>Milestones shipped:</strong> ${completed.length} of ${project.nodes.length}</li>
        <li><strong>Budget:</strong> ${formatBudget(project.budget)}</li>
        <li><strong>Status:</strong> ${project.progress >= 70 ? "Scaling" : project.progress >= 40 ? "Building momentum" : "Early execution"}</li>
      </ul>
    </div>
  </div>

  <h2>Execution highlights</h2>
  <ul>${highlights || "<li>Roadmap in early planning stage.</li>"}</ul>

  <h2>Why now</h2>
  <p style="font-size:14px;color:#475569">
    ${escapeHtml(project.name)} is systematically de-risking launch through structured execution —
    ${completed.length} milestone${completed.length === 1 ? "" : "s"} completed with clear visibility into remaining work.
  </p>

  <div class="footer">Confidential · ${escapeHtml(project.name)} · ${formatDate(new Date())}</div>
</body>
</html>`;
}
