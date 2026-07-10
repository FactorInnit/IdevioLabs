"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Crown,
  DollarSign,
  Flame,
  LayoutDashboard,
  Lock,
  Map,
  MessageSquare,
  Newspaper,
  Pause,
  Play,
  Plus,
  Rocket,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { AnimatedGauge, ScoreBar } from "@/components/founder/AnimatedGauge";
import { RadarChart } from "@/components/founder/charts/RadarChart";
import { GlassCard } from "@/components/founder/GlassCard";
import { StarField } from "@/components/founder/StarField";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { ASSISTANT_NAME, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SCENES = [
  { id: "command", label: "Command Center", icon: Sparkles, module: null as string | null },
  { id: "canvas", label: "Workspace", icon: Workflow, module: "workspace" },
  { id: "validator", label: "Validator", icon: Shield, module: "validator" },
  { id: "competitors", label: "Competitors", icon: Swords, module: "competitors" },
  { id: "roadmap", label: "Roadmap", icon: Map, module: "roadmap" },
  { id: "coach", label: "AI Coach", icon: Bot, module: "chat" },
] as const;

const SCENE_MS = 5200;
const COMPANY = "CalorieTrack";

const PORTFOLIO_NAV = [
  { label: "Command Center", icon: Sparkles, active: true },
  { label: "Daily Motivation", icon: Zap },
  { label: "Founder Brief", icon: Newspaper },
  { label: "Community", icon: Users, badge: "Soon" },
];

const COMPANY_NAV = [
  { id: "workspace", label: "Workspace", icon: Workflow },
  { id: "validator", label: "Validator", icon: Shield },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "competitors", label: "Competitors", icon: Swords, pro: true },
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "habits", label: "Daily Habits", icon: Flame, pro: true },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
];

export function FounderOSDemo() {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const start = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / SCENE_MS) * 100));
      if (elapsed >= SCENE_MS) {
        setScene((c) => (c + 1) % SCENES.length);
        setProgress(0);
      }
    }, 40);
    return () => window.clearInterval(tick);
  }, [playing, scene]);

  const active = SCENES[scene];
  const isPortfolio = active.id === "command";

  return (
    <section id="demo" className="relative scroll-mt-20 overflow-hidden bg-navy-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-950 to-[#040810]" />
      <StarField className="opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-300">
            Live product preview
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            The real {PRODUCT_NAME} Founder OS
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-200/80 sm:text-lg">
            Command center, canvas, AI validator, competitor intel, roadmap, and founder coach —
            exactly what your team ships with.
          </p>
        </div>

        <div className="demo-stage relative mx-auto mt-14 max-w-6xl">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.12] bg-[#0a1220]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-xl">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex min-w-0 max-w-lg flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-1.5 text-[11px] text-navy-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 demo-live-dot" />
                ideviolabs.com/{isPortfolio ? "dashboard" : `company/demo?module=${active.module}`}
              </div>
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label={playing ? "Pause demo" : "Play demo"}
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="h-1 bg-white/5">
              <div
                className="h-full bg-navy-400 transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="relative h-[min(72vw,660px)] overflow-hidden bg-[#eef2f7]">
              {SCENES.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "demo-scene-layer absolute inset-0",
                    index === scene ? "demo-scene-active z-10" : "pointer-events-none z-0"
                  )}
                  aria-hidden={index !== scene}
                >
                  <DemoScaleFrame>
                    <DemoShell
                      portfolio={item.id === "command"}
                      activeModule={item.module ?? undefined}
                      showCoach={
                        item.id !== "command" &&
                        item.id !== "coach"
                      }
                    >
                      {item.id === "command" && <CommandCenterScene />}
                      {item.id === "canvas" && <CanvasScene />}
                      {item.id === "validator" && <ValidatorScene />}
                      {item.id === "competitors" && <CompetitorsScene />}
                      {item.id === "roadmap" && <RoadmapScene />}
                      {item.id === "coach" && <CoachScene active={index === scene} />}
                    </DemoShell>
                  </DemoScaleFrame>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {SCENES.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setScene(index);
                  setProgress(0);
                  setPlaying(true);
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all sm:px-4",
                  index === scene
                    ? "border-white/20 bg-white text-navy-950 shadow-lg shadow-white/10"
                    : "border-white/10 bg-white/5 text-navy-200 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DemoScaleFrame({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="origin-top-left scale-[0.72]"
        style={{ width: "138.89%", minHeight: "138.89%" }}
      >
        {children}
      </div>
    </div>
  );
}

function DemoShell({
  portfolio,
  activeModule,
  showCoach,
  children,
}: {
  portfolio: boolean;
  activeModule?: string;
  showCoach?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="founder-bg flex min-h-[900px]">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-navy-900/6 bg-white/90 backdrop-blur-2xl">
        <div className="flex items-center gap-2.5 border-b border-navy-900/5 px-5 py-4">
          <Logo size="sm" />
          <div>
            <span className="font-display text-sm font-bold text-navy-900">{PRODUCT_NAME}</span>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Founder OS
            </p>
          </div>
        </div>

        {!portfolio && (
          <div className="border-b border-navy-900/5 px-4 py-3">
            <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <ChevronLeft className="h-3 w-3" />
              All companies
            </div>
            <p className="truncate font-display text-sm font-semibold text-navy-900">{COMPANY}</p>
            <p className="text-[10px] text-slate-400">Company Digital Twin</p>
          </div>
        )}

        <nav className="flex-1 overflow-hidden px-2 py-3">
          {portfolio
            ? PORTFOLIO_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm",
                      item.active
                        ? "sidebar-item-active font-semibold text-navy-900"
                        : "font-medium text-slate-500"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", item.active && "text-navy-600")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })
            : COMPANY_NAV.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeModule;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px]",
                      active
                        ? "sidebar-item-active font-semibold text-navy-900"
                        : "font-medium text-slate-500"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-navy-600")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.pro && <Lock className="h-3 w-3 shrink-0 text-slate-400" />}
                  </div>
                );
              })}
        </nav>

        <div className="px-3 pb-3">
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 p-3.5 text-white shadow-lg shadow-navy-900/20">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">Upgrade plan</span>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-white/75">
              Habits, competitors, CEO review & exports.
            </p>
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1">
        <div className="min-w-0 flex-1">{children}</div>
        {showCoach && <DemoCoachSidebar />}
      </main>
    </div>
  );
}

function ModuleHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <header className="border-b border-navy-900/6 bg-white/40 px-8 py-6 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">{eyebrow}</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
      )}
    </header>
  );
}

function DemoCoachSidebar() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-l border-navy-900/8 bg-white/95 shadow-xl">
      <div className="flex items-center gap-2.5 border-b border-navy-900/8 bg-navy-950 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold text-white">
            {ASSISTANT_NAME}
            <Sparkles className="h-3 w-3 text-navy-300" />
          </p>
          <p className="text-[9px] text-white/50">AI Founder Coach · always here</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden p-3">
        <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2.5 text-[11px] leading-relaxed text-navy-900">
          Hi! I&apos;m your coach for {COMPANY}. Ask about strategy, validation, or tell me to update your
          roadmap.
        </div>
        <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-navy-900 px-3 py-2 text-[11px] text-white">
          What should I focus on this week?
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2.5 text-[11px] leading-relaxed text-navy-900">
          Run 10 user interviews on logging friction, then ship a 2-week MVP with manual food entry only.
        </div>
      </div>
      <div className="border-t border-slate-200 p-2.5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-400">
          Ask {ASSISTANT_NAME} about {COMPANY}…
        </div>
      </div>
    </aside>
  );
}

function CommandCenterScene() {
  return (
    <div className="min-h-[900px]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(74,120,180,0.28),transparent_50%)]" />
        <StarField className="z-[2] opacity-80" />

        <div className="relative z-10 px-8 py-9">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-navy-300" />
                Founder Command Center
              </div>
              <h1 className="font-display text-4xl font-bold text-white">
                Good morning, <span className="text-gradient-light">Tanmay</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm text-navy-200/90">
                Portfolio health, today&apos;s priorities, and your company digital twins — one cockpit.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-navy-900 shadow-xl shadow-black/20">
              <Plus className="h-4 w-4" />
              New company
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-100">
            <Flame className="h-3.5 w-3.5 text-orange-300" />
            12-day founder streak · 3 habits on track
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              { label: "Companies", value: "1", icon: Rocket },
              { label: "Portfolio health", value: "78", icon: TrendingUp },
              { label: "Avg progress", value: "42%", icon: Zap },
              { label: "Launch prob.", value: "61%", icon: Target },
              { label: "Plan", value: "Free", icon: Crown },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-md"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <stat.icon className="h-3.5 w-3.5 text-navy-200" />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-white/80">
                    {stat.label}
                  </p>
                  <p className="font-display text-lg font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-6">
        <GlassCard className="mb-5 border-amber-200/50 bg-amber-50/90 p-4" hover={false}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Today</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {[
              "Interview 3 potential users",
              "Finish landing page copy",
              "Set up Stripe test mode",
            ].map((task) => (
              <span
                key={task}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-navy-800"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {task}
              </span>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <GlassCard dark className="relative overflow-hidden p-5" hover={false}>
              <div className="relative flex gap-5">
                <AnimatedGauge value={78} label="Portfolio Health" sublabel="1 active" size={120} light />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-300">
                      Mission control
                    </p>
                    <h2 className="font-display text-lg font-bold text-white">Live portfolio pulse</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatPill label="Avg completion" value="42%" />
                    <StatPill label="Active twins" value="1" />
                  </div>
                  <p className="rounded-xl bg-white/5 px-3 py-2 text-xs text-navy-100">
                    <span className="font-semibold text-white">Focus:</span> Validate demand with real users
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-4">
            <GlassCard className="h-full p-4" hover={false}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Quick launch</p>
              <h3 className="font-display text-sm font-bold text-navy-900">Jump into your twin</h3>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { label: "Canvas", icon: Workflow },
                  { label: "Validator", icon: Shield },
                  { label: "Roadmap", icon: Map },
                  { label: "Compete", icon: Swords },
                  { label: "Habits", icon: Flame },
                  { label: "Finance", icon: DollarSign },
                ].map((mod) => (
                  <div
                    key={mod.label}
                    className="rounded-lg border border-navy-900/6 bg-gradient-to-br from-white to-navy-50/50 p-2.5"
                  >
                    <mod.icon className="mb-1 h-3.5 w-3.5 text-navy-600" />
                    <span className="text-[10px] font-bold text-navy-900">{mod.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-3">
            <GlassCard className="h-full p-4" hover={false}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">AI usage</p>
              <h3 className="font-display text-sm font-bold text-navy-900">Free plan</h3>
              <div className="mt-3 space-y-2.5">
                {[
                  ["Coach chats", "18 / 25"],
                  ["Validator runs", "1 / 1"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-[10px]">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-navy-800">{val}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-navy-900/8">
                      <div className="h-full w-[72%] rounded-full bg-navy-700" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-8">
        <div className="mb-3 h-1 w-12 rounded-full bg-gradient-to-r from-navy-800 to-navy-400" />
        <h2 className="font-display text-xl font-bold text-navy-900">My Companies</h2>

        <GlassCard className="relative mt-4 overflow-hidden p-0" hover>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-navy-600 to-navy-400" />
          <div className="grid lg:grid-cols-[1fr_240px]">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-600 text-lg font-bold text-white shadow-lg">
                  C
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                      Getting Started
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                      ↗ 61% launch prob.
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-navy-900">{COMPANY}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Budget-aware calorie tracker for busy professionals — $200 bootstrap plan.
                  </p>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {[
                      ["Progress", "42%"],
                      ["Valuation", "$240K"],
                      ["Budget", "$200"],
                      ["Updated", "2m ago"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[9px] uppercase text-slate-400">{k}</p>
                        <p className="font-display text-sm font-bold text-navy-900">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-navy-900/6 bg-navy-50/30 p-5 lg:border-l lg:border-t-0">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Health score</p>
                <p className="font-display text-4xl font-bold text-navy-900">78</p>
                <p className="text-[10px] text-slate-500">Strong idea — prove retention</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Canvas", "Validate", "Roadmap"].map((l) => (
                  <span
                    key={l}
                    className="rounded-lg border border-navy-900/8 bg-white/80 px-2.5 py-1.5 text-[10px] font-semibold text-navy-800"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <p className="text-[8px] font-semibold uppercase tracking-wider text-navy-300">{label}</p>
      <p className="font-display text-base font-bold text-white">{value}</p>
    </div>
  );
}

function CanvasScene() {
  const blocks = [
    { title: "Validate the Problem", cat: "idea" as const, x: 32, y: 32, progress: 72, step: 1, color: "#081a3a", light: "#e8edf5", tasks: 4 },
    { title: "Build MVP", cat: "product" as const, x: 320, y: 20, progress: 38, step: 2, color: "#2563eb", light: "#dbeafe", tasks: 6 },
    { title: "Pricing & Revenue", cat: "finance" as const, x: 610, y: 40, progress: 20, step: 3, color: "#059669", light: "#d1fae5", tasks: 3 },
    { title: "Go-to-Market", cat: "marketing" as const, x: 160, y: 248, progress: 15, step: 4, color: "#7c3aed", light: "#ede9fe", tasks: 5 },
    { title: "Legal & Compliance", cat: "legal" as const, x: 440, y: 200, progress: 10, step: 5, color: "#64748b", light: "#f1f5f9", tasks: 2 },
    { title: "Launch & Growth", cat: "launch" as const, x: 500, y: 300, progress: 8, step: 6, color: "#ea580c", light: "#ffedd5", tasks: 4 },
  ];

  return (
    <div className="relative flex min-h-[900px] flex-col">
      <ModuleHeader
        eyebrow={COMPANY}
        title="Company Canvas"
        description="Drag blocks between sections, connect flows, and track every task on one mind map."
      />
      <div className="relative flex-1 canvas-workspace-flow">
        <div className="absolute inset-0 founder-grid opacity-40" />
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="demoFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a78b4" />
              <stop offset="100%" stopColor="#7aa3d4" />
            </linearGradient>
          </defs>
          <path d="M 190 80 Q 260 55 360 65" fill="none" stroke="url(#demoFlow)" strokeWidth="2.5" className="demo-flow-path" />
          <path d="M 500 75 Q 560 60 660 85" fill="none" stroke="url(#demoFlow)" strokeWidth="2.5" className="demo-flow-path demo-flow-delay-1" />
          <path d="M 130 120 Q 150 190 200 270" fill="none" stroke="url(#demoFlow)" strokeWidth="2" strokeDasharray="6 4" className="demo-flow-path demo-flow-delay-2" />
          <path d="M 400 110 Q 460 180 540 290" fill="none" stroke="url(#demoFlow)" strokeWidth="2" strokeDasharray="6 4" className="demo-flow-path demo-flow-delay-3" />
        </svg>

        {blocks.map((block, i) => {
          const cat = CATEGORY_CONFIG[block.cat];
          const selected = block.title === "Validate the Problem";
          return (
            <div
              key={block.title}
              className={cn(
                "demo-block absolute w-[220px] rounded-2xl border-2 p-3.5 shadow-lg transition-shadow",
                selected && "ring-2 ring-navy-400/40 ring-offset-2"
              )}
              style={{
                left: block.x,
                top: block.y,
                borderColor: block.color,
                backgroundColor: block.light,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white"
                  style={{ backgroundColor: cat.minimap }}
                >
                  {String(block.step).padStart(2, "0")}
                </span>
                <span className="text-[8px] font-bold uppercase text-navy-500">{cat.shortLabel}</span>
              </div>
              <p className="mt-1.5 font-display text-xs font-bold text-navy-900">{block.title}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-900/10">
                <div
                  className="demo-fill h-full rounded-full"
                  style={
                    {
                      backgroundColor: block.color,
                      "--demo-target": `${block.progress}%`,
                    } as CSSProperties
                  }
                />
              </div>
              <p className="mt-1.5 text-[9px] text-slate-500">{block.tasks} tasks · {block.progress}%</p>
            </div>
          );
        })}

        <div className="demo-cursor absolute left-[280px] top-[95px] z-20">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-navy-900 bg-white shadow-md" />
        </div>

        <div className="absolute bottom-4 left-4 rounded-xl border border-navy-900/10 bg-white/95 px-3 py-2 shadow-md">
          <p className="text-[11px] font-bold text-navy-900">6 blocks · 4 connections</p>
          <p className="text-[9px] text-slate-500">Drag · Connect · Edit tasks</p>
        </div>

        <div className="absolute bottom-4 right-[300px] h-20 w-32 overflow-hidden rounded-lg border border-navy-900/10 bg-navy-950/90 shadow-lg">
          <div className="border-b border-white/10 px-2 py-0.5 text-[7px] font-bold uppercase tracking-wider text-navy-300">
            Minimap
          </div>
          <div className="relative h-full p-1.5">
            {blocks.map((b) => (
              <span
                key={b.title}
                className="absolute h-1.5 w-2 rounded-sm"
                style={{
                  left: `${(b.x / 900) * 100}%`,
                  top: `${(b.y / 380) * 100}%`,
                  backgroundColor: b.color,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidatorScene() {
  const dimensions = [
    ["Demand", 82],
    ["Competition", 61],
    ["Moat", 48],
    ["Execution", 68],
    ["Capital", 55],
    ["Timing", 77],
  ];

  return (
    <div className="min-h-[900px]">
      <ModuleHeader
        eyebrow={COMPANY}
        title="Startup Validator"
        description="In-depth AI report with radar charts, pros/cons, risks, and improvement actions."
      />
      <div className="p-6">
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[9px] font-semibold text-violet-800">
                AI research report
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-navy-900">
                Promising — validate with real users
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-600">
                {COMPANY} targets busy professionals who quit MyFitnessPal due to complexity. Large market,
                crowded space — win on speed and AI-native logging.
              </p>
            </div>
            <AnimatedGauge value={78} label="Overall score" size={110} />
          </div>
        </GlassCard>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-4" hover={false}>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dimension radar
            </p>
            <RadarChart
              labels={dimensions.map(([l]) => l as string)}
              values={dimensions.map(([, v]) => v as number)}
              size={220}
            />
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Breakdown</p>
            <div className="space-y-2">
              {dimensions.map(([label, val], i) => (
                <ScoreBar key={label as string} label={label as string} value={val as number} delay={i * 50} />
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-4" hover={false}>
            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
              <li>· Clear daily use case with measurable outcomes</li>
              <li>· AI logging wedge vs. bloated incumbents</li>
              <li>· Bootstrap-friendly MVP path</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-4" hover={false}>
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-700">
              <AlertTriangle className="h-3.5 w-3.5" /> Risks
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
              <li>· MyFitnessPal brand and database moat</li>
              <li>· High churn without habit design</li>
              <li>· App store discovery costs</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function CompetitorsScene() {
  const competitors = [
    {
      name: "MyFitnessPal",
      pricing: "$19.99/mo",
      weakness: "Cluttered UX, aggressive paywalls",
      score: 58,
    },
    {
      name: "Lose It!",
      pricing: "$39.99/yr",
      weakness: "Weak AI, dated design",
      score: 64,
    },
    {
      name: "Cronometer",
      pricing: "$9.99/mo",
      weakness: "Steep learning curve",
      score: 71,
    },
  ];

  return (
    <div className="min-h-[900px]">
      <ModuleHeader
        eyebrow={COMPANY}
        title="Competitor Intelligence"
        description="Where competitors fail, how to beat them, and one-click add to your roadmap."
      />
      <div className="p-6">
        <GlassCard className="p-4" hover={false}>
          <p className="text-xs leading-relaxed text-slate-600">
            {COMPANY} enters a crowded nutrition market. Win by targeting founders who need{" "}
            <strong className="text-navy-900">30-second logging</strong> and AI coaching — not another bloated
            fitness app.
          </p>
        </GlassCard>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {competitors.map((c, i) => (
            <div key={c.name} className="demo-rise" style={{ animationDelay: `${i * 80}ms` }}>
              <GlassCard className="p-4" hover={false}>
              <div className="flex items-start justify-between">
                <h3 className="font-display text-sm font-bold text-navy-900">{c.name}</h3>
                <span className="rounded-full bg-navy-900/8 px-2 py-0.5 text-[9px] font-bold text-navy-700">
                  Beat: {c.score}%
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{c.pricing}</p>
              <p className="mt-2 text-[11px] text-red-700/90">Fails: {c.weakness}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-900/8">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.score}%` }} />
              </div>
              </GlassCard>
            </div>
          ))}
        </div>

        <GlassCard className="mt-4 p-4" hover={false}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Beat strategy</p>
          <h3 className="font-display text-sm font-bold text-navy-900">Win on AI-native logging</h3>
          <ol className="mt-2 space-y-1.5 text-[11px] text-slate-600">
            <li>1. Photo-based meal recognition with one-tap confirm</li>
            <li>2. Daily AI coach that adjusts targets from behavior</li>
            <li>3. Founder habit tracker bundled in — practice what you sell</li>
          </ol>
          <p className="mt-3 text-[10px] font-semibold text-navy-700">Timeline: 0–60 days · Add to roadmap →</p>
        </GlassCard>
      </div>
    </div>
  );
}

function RoadmapScene() {
  const cols = [
    {
      id: "now",
      label: "Now",
      sub: "In progress",
      color: "border-blue-200 bg-blue-50/50",
      items: [
        { title: "Validate the Problem", cat: "Idea", pct: 72, due: "This week" },
        { title: "Landing page v1", cat: "Marketing", pct: 45, due: "Fri" },
      ],
    },
    {
      id: "next",
      label: "Next",
      sub: "Up next",
      color: "border-violet-200 bg-violet-50/40",
      items: [
        { title: "Build MVP", cat: "Product", pct: 38, due: "Week 2" },
        { title: "Pricing experiment", cat: "Finance", pct: 20, due: "Week 3" },
        { title: "User interviews ×10", cat: "Idea", pct: 30, due: "Ongoing" },
      ],
    },
    {
      id: "later",
      label: "Later",
      sub: "Queued",
      color: "border-slate-200 bg-slate-50/80",
      items: [
        { title: "Launch TikTok ads", cat: "Marketing", pct: 0, due: "Month 2" },
        { title: "Hire part-time designer", cat: "Team", pct: 0, due: "Month 3" },
      ],
    },
    {
      id: "done",
      label: "Done",
      sub: "Shipped",
      color: "border-emerald-200 bg-emerald-50/40",
      items: [
        { title: "Idea brief & budget", cat: "Idea", pct: 100, due: "Done" },
        { title: "Competitor scan", cat: "Research", pct: 100, due: "Done" },
      ],
    },
  ];

  return (
    <div className="min-h-[900px]">
      <ModuleHeader
        eyebrow={COMPANY}
        title="Execution Roadmap"
        description="Visual execution map with sequence, progress sliders, and kanban board view."
      />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["Kanban", "Timeline", "List"].map((view, i) => (
              <span
                key={view}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[10px] font-semibold",
                  i === 0 ? "bg-navy-900 text-white" : "bg-white text-slate-500 border border-navy-900/10"
                )}
              >
                {view}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-navy-900/8 px-3 py-1 text-[10px] font-semibold text-navy-700">
              42% overall
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
              2 shipped
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cols.map((col, ci) => (
            <div
              key={col.id}
              className={cn("demo-rise rounded-2xl border p-2.5", col.color)}
              style={{ animationDelay: `${ci * 80}ms` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-display text-xs font-bold text-navy-900">{col.label}</p>
                  <p className="text-[9px] text-slate-400">{col.sub}</p>
                </div>
                <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-navy-600">
                  {col.items.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-navy-900/6 bg-white p-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[10px] font-bold leading-snug text-navy-900">{item.title}</p>
                      <span className="shrink-0 text-[8px] font-semibold text-slate-400">{item.due}</span>
                    </div>
                    <span className="mt-1 inline-block rounded bg-navy-900/6 px-1.5 py-0.5 text-[8px] font-semibold text-navy-700">
                      {item.cat}
                    </span>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-navy-900/8">
                      <div
                        className="h-full rounded-full bg-navy-600"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[8px] text-slate-400">{item.pct}% complete</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoachScene({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }
    const full =
      "Focus on one wedge: busy professionals who want simple calorie tracking.\n\n1. Ship a 2-week MVP with manual food logging\n2. Run 10 interviews on why they quit MFP\n3. Add AI photo logging only after retention hits 40%\n\nYour budget is $200 — stay bootstrap until you prove retention.";
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 14);
    return () => window.clearInterval(id);
  }, [active]);

  const messages = [
    { role: "assistant" as const, text: `Hi! I'm ${ASSISTANT_NAME}, your coach for ${COMPANY}. Ask me anything about strategy, validation, competitors, or your roadmap.` },
    { role: "user" as const, text: "What's the best way to build my website?" },
    { role: "assistant" as const, text: typed, typing: true },
  ];

  return (
    <div className="flex min-h-[900px] flex-col">
      <ModuleHeader
        eyebrow={COMPANY}
        title="AI Founder Coach"
        description="ChatGPT-powered coach that knows your startup context — strategy, validation, and roadmap updates."
      />
      <div className="flex flex-1 flex-col p-6">
        <GlassCard className="flex flex-1 flex-col overflow-hidden" hover={false}>
          <div className="flex items-center gap-3 border-b border-navy-900/8 bg-navy-950 px-5 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-white">
                {ASSISTANT_NAME}
                <Sparkles className="h-3 w-3 text-navy-300" />
              </p>
              <p className="text-[10px] text-white/50">Knows {COMPANY} · budget · roadmap blocks</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-hidden p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex gap-2.5", m.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    m.role === "user" ? "bg-navy-200 text-navy-800" : "bg-navy-900 text-white"
                  )}
                >
                  {m.role === "user" ? "You" : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-tr-sm bg-navy-900 text-white"
                      : "rounded-tl-sm bg-slate-100 text-navy-900"
                  )}
                >
                  {m.text}
                  {m.typing && (
                    <span className="demo-cursor ml-0.5 inline-block h-4 w-0.5 bg-navy-700 align-middle" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                "What should I do first?",
                "How do I validate this?",
                "Who are my competitors?",
                "Add a marketing block",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-navy-800"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
                Ask {ASSISTANT_NAME} about {COMPANY}…
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
