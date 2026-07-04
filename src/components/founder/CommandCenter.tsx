"use client";

import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Lock,
  Map,
  Plus,
  Rocket,
  Shield,
  Sparkles,
  Swords,
  Sun,
  Target,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AnimatedGauge } from "./AnimatedGauge";
import { CompanyCard } from "./CompanyCard";
import { StreakBadge } from "./StreakBadge";
import { StarField } from "./StarField";
import { UsageLimitsPanel } from "./UsageLimitsPanel";
import { computeCompanyMetrics } from "@/lib/founder-metrics";
import { companyModuleHref } from "@/lib/founder-nav";
import { canAccessProFeature } from "@/lib/plan-access";
import { isProOnlyModule } from "@/lib/pro-features";
import { cn } from "@/lib/utils";

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes: { id: string; progress: number; category: string }[];
}

interface CommandCenterProps {
  firstName: string;
  planName: string;
  planId: string;
  projects: ProjectSummary[];
  avgHealth: number;
  onNewCompany: () => void;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_MODULES = [
  { id: "workspace" as const, label: "Canvas", icon: Workflow, desc: "Mind map" },
  { id: "validator" as const, label: "Validator", icon: Shield, desc: "AI report" },
  { id: "competitors" as const, label: "Competitors", icon: Swords, desc: "Beat them" },
  { id: "roadmap" as const, label: "Roadmap", icon: Map, desc: "Sequence" },
  { id: "habits" as const, label: "Habits", icon: Flame, desc: "Daily CEO" },
  { id: "finance" as const, label: "Finance", icon: Target, desc: "Runway" },
];

export function CommandCenterHero({
  firstName,
  planName,
  projectCount,
  avgHealth,
  avgProgress,
  launchProb,
  priority,
  projectIds,
  onNewCompany,
}: {
  firstName: string;
  planName: string;
  projectCount: number;
  avgHealth: number;
  avgProgress: number;
  launchProb: number;
  priority: string;
  projectIds: string[];
  onNewCompany: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {/* Base + atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(74,120,180,0.35),transparent_50%)]" />
      <div className="pointer-events-none absolute -right-24 top-0 z-[1] h-72 w-72 rounded-full bg-navy-400/20 blur-3xl dashboard-orb" />
      <div className="pointer-events-none absolute -left-16 bottom-0 z-[1] h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl dashboard-orb-delayed" />
      <div className="pointer-events-none absolute inset-0 z-[1] grid-texture opacity-[0.07]" />

      {/* Stars sit above the gradient so they stay visible */}
      <StarField className="z-[2]" />

      <div className="relative z-10 px-8 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-navy-300" />
                Founder Command Center
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                {timeGreeting()},{" "}
                <span className="text-gradient-light">{firstName}</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-navy-200/90">
                Your portfolio, live metrics, and next moves —{" "}
                <span className="font-serif-accent text-navy-100">one cockpit</span>{" "}
                for every company you&apos;re building.
              </p>
            </div>

            <button
              onClick={onNewCompany}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-navy-900 shadow-xl shadow-black/20 transition hover:scale-[1.02] hover:shadow-2xl"
            >
              <Plus className="h-4 w-4 transition group-hover:rotate-90" />
              New company
            </button>
          </div>

          <div className="mt-6">
            <StreakBadge projectIds={projectIds} light />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: "Companies", value: String(projectCount), icon: Rocket },
              { label: "Portfolio health", value: `${avgHealth || 72}`, icon: TrendingUp },
              { label: "Avg progress", value: projectCount ? `${avgProgress}%` : "—", icon: Zap },
              { label: "Plan", value: planName, icon: Sun },
              { label: "Launch prob.", value: projectCount ? `${launchProb}%` : "—", icon: Target },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.1]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <stat.icon className="h-4 w-4 text-navy-200" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/85">
                    {stat.label}
                  </p>
                  <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {priority && (
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.08] to-transparent p-5 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20">
                <Flame className="h-5 w-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
                  Today&apos;s priority
                </p>
                <p className="font-display text-lg font-semibold text-white">{priority}</p>
              </div>
              <ArrowRight className="hidden h-5 w-5 text-white/40 sm:block" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MissionControlCard({
  avgHealth,
  avgProgress,
  projectCount,
  priority,
}: {
  avgHealth: number;
  avgProgress: number;
  projectCount: number;
  priority: string;
}) {
  return (
    <GlassCard dark className="relative overflow-hidden p-6 lg:p-8" hover={false}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-navy-400/20 blur-2xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <AnimatedGauge
          value={avgHealth || 72}
          label="Portfolio Health"
          sublabel={projectCount ? `${projectCount} active` : "No companies"}
          size={132}
          light
        />
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-300">
              Mission control
            </p>
            <h2 className="font-display text-xl font-bold text-white">Live portfolio pulse</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatPill label="Avg completion" value={projectCount ? `${avgProgress}%` : "—"} />
            <StatPill label="Active twins" value={String(projectCount)} />
          </div>
          {priority && (
            <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-navy-100">
              <span className="font-semibold text-white">Focus:</span> {priority}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-navy-300">{label}</p>
      <p className="font-display text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function QuickLaunchpad({
  companyId,
  planId,
}: {
  companyId?: string;
  planId: string;
}) {
  const hasPro = canAccessProFeature(planId);

  if (!companyId) {
    return (
      <GlassCard className="flex h-full flex-col items-center justify-center p-8 text-center" hover={false}>
        <Workflow className="mb-3 h-8 w-8 text-navy-400" />
        <p className="font-display font-semibold text-navy-900">Quick launchpad</p>
        <p className="mt-1 text-sm text-slate-500">Create a company to unlock module shortcuts</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full p-5" hover={false}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Quick launch
          </p>
          <h3 className="font-display font-bold text-navy-900">Jump into your twin</h3>
        </div>
        <Zap className="h-5 w-5 text-navy-500" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_MODULES.map((mod) => {
          const locked = isProOnlyModule(mod.id) && !hasPro;
          return (
            <Link
              key={mod.id}
              href={companyModuleHref(companyId, mod.id)}
              className={cn(
                "group relative flex flex-col rounded-xl border border-navy-900/6 bg-gradient-to-br from-white to-navy-50/50 p-3 transition hover:border-navy-400/30 hover:shadow-md hover:shadow-navy-900/5",
                locked && "opacity-90"
              )}
            >
              {locked && (
                <Lock className="absolute right-2 top-2 h-3 w-3 text-slate-400" aria-hidden />
              )}
              <mod.icon className="mb-2 h-4 w-4 text-navy-600 transition group-hover:scale-110" />
              <span className="text-xs font-bold text-navy-900">{mod.label}</span>
              <span className="text-[10px] text-slate-400">{mod.desc}</span>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

function PortfolioInsights({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) return null;

  const top = projects[0];
  const metrics = computeCompanyMetrics(top);
  const categories = [...new Set(top.nodes.map((n) => n.category))];

  return (
    <GlassCard className="h-full p-5" hover={false}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Top company snapshot
      </p>
      <h3 className="mt-1 font-display text-lg font-bold text-navy-900">{top.name}</h3>
      <div className="mt-4 space-y-3">
        {Object.entries(metrics.breakdown)
          .slice(0, 4)
          .map(([key, val], i) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium capitalize text-navy-800">{key.replace(/([A-Z])/g, " $1")}</span>
                <span className="tabular-nums text-slate-500">{val}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-navy-900/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-400"
                  style={{ width: `${val}%`, transitionDelay: `${i * 80}ms` }}
                />
              </div>
            </div>
          ))}
      </div>
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-navy-900/6 px-2 py-0.5 text-[10px] font-semibold capitalize text-navy-700"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export function CommandCenter({
  firstName,
  planName,
  planId,
  projects,
  avgHealth,
  onNewCompany,
}: CommandCenterProps) {
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
      : 0;
  const launchProb = projects[0] ? computeCompanyMetrics(projects[0]).launchProbability : 0;
  const priority = projects[0]
    ? computeCompanyMetrics(projects[0]).nextMilestone
    : "Create your first company to get started.";
  const projectIds = projects.map((p) => p.id);

  return (
    <div className="relative min-h-screen">
      <CommandCenterHero
        firstName={firstName}
        planName={planName}
        projectCount={projects.length}
        avgHealth={avgHealth}
        avgProgress={avgProgress}
        launchProb={launchProb}
        priority={priority}
        projectIds={projectIds}
        onNewCompany={onNewCompany}
      />

      {projects.length > 0 && (
        <section className="relative mx-auto max-w-7xl px-8 py-8">
          {planId === "free" && (
            <div className="mb-5">
              <UsageLimitsPanel planId={planId} />
            </div>
          )}
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <MissionControlCard
                avgHealth={avgHealth}
                avgProgress={avgProgress}
                projectCount={projects.length}
                priority={priority}
              />
            </div>
            <div className="lg:col-span-4">
              <QuickLaunchpad companyId={projects[0]?.id} planId={planId} />
            </div>
            <div className="lg:col-span-3">
              <PortfolioInsights projects={projects} />
            </div>
          </div>
        </section>
      )}

      {projects.length === 0 && planId === "free" && (
        <section className="relative mx-auto max-w-7xl px-8 pt-8">
          <UsageLimitsPanel planId={planId} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-8 pb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 h-1 w-12 rounded-full bg-gradient-to-r from-navy-800 to-navy-400" />
            <h2 className="font-display text-2xl font-bold text-navy-900">My Companies</h2>
            <p className="text-sm text-slate-500">
              Each company is a live digital twin — canvas, AI reports, and roadmap in sync
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <GlassCard className="relative overflow-hidden py-20 text-center" hover={false}>
            <div className="pointer-events-none absolute inset-0 founder-grid opacity-50" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-500 shadow-lg shadow-navy-900/30 founder-glow-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-navy-900">Launch your first twin</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                Describe your startup idea and Idevio builds your Company Digital Twin — mind map
                canvas, validator, competitors, and more.
              </p>
              <button
                onClick={onNewCompany}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-800"
              >
                <Plus className="h-4 w-4" />
                Create your first company
              </button>
            </div>
          </GlassCard>
        ) : (
          <div
            className={cn(
              "grid gap-5",
              projects.length === 1 ? "grid-cols-1" : "lg:grid-cols-2"
            )}
          >
            {projects.map((p, i) => (
              <CompanyCard key={p.id} {...p} featured={projects.length === 1} priority={i === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
