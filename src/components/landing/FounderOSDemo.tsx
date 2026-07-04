"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  Bot,
  ChevronLeft,
  Crown,
  Flame,
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
import { GlassCard } from "@/components/founder/GlassCard";
import { StarField } from "@/components/founder/StarField";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { ASSISTANT_NAME, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SCENES = [
  { id: "command", label: "Command Center", icon: Sparkles, module: null as string | null },
  { id: "canvas", label: "Workspace", icon: Workflow, module: "workspace" },
  { id: "validator", label: "Validator", icon: Shield, module: "validator" },
  { id: "roadmap", label: "Roadmap", icon: Map, module: "roadmap" },
  { id: "coach", label: "AI Coach", icon: Bot, module: "chat" },
] as const;

const SCENE_MS = 5600;
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
  { id: "habits", label: "Daily Habits", icon: Flame, pro: true },
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
      <StarField className="opacity-70" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl demo-orb" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl demo-orb-delayed" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-300">
            Live product preview
          </p>
          <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            The real {PRODUCT_NAME} Founder OS
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-200/80 sm:text-lg">
            Same command center, canvas, validator, and coach your founders use — not a mockup
            template.
          </p>
        </div>

        <div className="demo-stage relative mx-auto mt-14 max-w-6xl">
          <div className="demo-glow-ring pointer-events-none absolute -inset-px rounded-[1.85rem] opacity-80" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1220] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-navy-900/90 px-4 py-3 backdrop-blur-xl">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex min-w-0 max-w-lg flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] text-navy-200">
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
                className="h-full bg-gradient-to-r from-navy-400 via-white to-navy-300 transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="relative h-[min(68vw,620px)] overflow-hidden">
              {SCENES.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "demo-scene-layer absolute inset-0 transition-all duration-700",
                    index === scene
                      ? "demo-scene-active z-10 opacity-100"
                      : "pointer-events-none z-0 opacity-0"
                  )}
                  aria-hidden={index !== scene}
                >
                  <DemoScaleFrame>
                    <DemoShell
                      portfolio={item.id === "command"}
                      activeModule={item.module ?? undefined}
                    >
                      {item.id === "command" && <CommandCenterScene />}
                      {item.id === "canvas" && <CanvasScene />}
                      {item.id === "validator" && <ValidatorScene />}
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
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                  index === scene
                    ? "border-white/20 bg-white text-navy-950 shadow-lg shadow-white/10"
                    : "border-white/10 bg-white/5 text-navy-200 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
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
    <div className="absolute inset-0 overflow-hidden bg-[#eef2f7]">
      <div
        className="origin-top-left scale-[0.68]"
        style={{ width: "147.06%", minHeight: "147%" }}
      >
        {children}
      </div>
    </div>
  );
}

function DemoShell({
  portfolio,
  activeModule,
  children,
}: {
  portfolio: boolean;
  activeModule?: string;
  children: ReactNode;
}) {
  return (
    <div className="founder-bg flex min-h-[920px]">
      <aside className="flex w-[252px] shrink-0 flex-col border-r border-navy-900/6 bg-white/80 backdrop-blur-2xl">
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

        <nav className="flex-1 px-2 py-3">
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
                      "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm",
                      active
                        ? "sidebar-item-active font-semibold text-navy-900"
                        : "font-medium text-slate-500"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active && "text-navy-600")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.pro && <Lock className="h-3 w-3 text-slate-400" />}
                  </div>
                );
              })}
        </nav>

        <div className="px-3 pb-3">
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 p-4 text-white shadow-lg shadow-navy-900/20">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">Upgrade plan</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/75">
              Unlock habits, competitors, CEO review & exports.
            </p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function CommandCenterScene() {
  return (
    <div className="min-h-[920px]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(74,120,180,0.35),transparent_50%)]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-navy-400/20 blur-3xl demo-orb" />
        <StarField className="z-[2]" />

        <div className="relative z-10 px-8 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-navy-300" />
                Founder Command Center
              </div>
              <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
                Good morning, <span className="text-gradient-light">Tanmay</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-navy-200/90">
                Your portfolio, live metrics, and next moves —{" "}
                <span className="font-serif-accent text-navy-100">one cockpit</span> for every
                company you&apos;re building.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-navy-900 shadow-xl shadow-black/20">
              <Plus className="h-4 w-4" />
              New company
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: "Companies", value: "1", icon: Rocket },
              { label: "Portfolio health", value: "78", icon: TrendingUp },
              { label: "Avg progress", value: "42%", icon: Zap },
              { label: "Launch prob.", value: "61%", icon: Target },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-md"
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-8">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <GlassCard dark className="relative overflow-hidden p-6" hover={false}>
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-navy-400/20 blur-2xl" />
              <div className="relative flex gap-6">
                <AnimatedGauge
                  value={78}
                  label="Portfolio Health"
                  sublabel="1 active"
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
                    <StatPill label="Avg completion" value="42%" />
                    <StatPill label="Active twins" value="1" />
                  </div>
                  <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-navy-100">
                    <span className="font-semibold text-white">Focus:</span> Validate the Problem
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-4">
            <GlassCard className="h-full p-5" hover={false}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Quick launch
              </p>
              <h3 className="font-display font-bold text-navy-900">Jump into your twin</h3>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Canvas", icon: Workflow },
                  { label: "Validator", icon: Shield },
                  { label: "Roadmap", icon: Map },
                  { label: "Compete", icon: Swords },
                  { label: "Habits", icon: Flame },
                  { label: "Finance", icon: Target },
                ].map((mod) => (
                  <div
                    key={mod.label}
                    className="rounded-xl border border-navy-900/6 bg-gradient-to-br from-white to-navy-50/50 p-3"
                  >
                    <mod.icon className="mb-2 h-4 w-4 text-navy-600" />
                    <span className="text-xs font-bold text-navy-900">{mod.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-3">
            <GlassCard className="h-full p-5" hover={false}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Top company snapshot
              </p>
              <h3 className="mt-1 font-display text-lg font-bold text-navy-900">{COMPANY}</h3>
              <div className="mt-4 space-y-3">
                {[
                  ["Market", 68],
                  ["Execution", 42],
                  ["Competition", 55],
                  ["Business Model", 71],
                ].map(([label, val], i) => (
                  <ScoreBar key={label as string} label={label as string} value={val as number} delay={i * 80} />
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-10">
        <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-navy-800 to-navy-400" />
        <h2 className="font-display text-2xl font-bold text-navy-900">My Companies</h2>

        <GlassCard className="relative mt-5 overflow-hidden p-0" hover>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-navy-600 to-navy-400" />
          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="p-8">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-600 text-xl font-bold text-white shadow-lg shadow-navy-900/30">
                  C
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      Getting Started
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ↗ 61% launch prob.
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-bold text-navy-900">{COMPANY}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    A budget-aware startup plan for a calorie tracker app.
                  </p>
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    {[
                      ["Progress", "42%"],
                      ["Valuation", "$240K"],
                      ["Next", "Validate MVP"],
                      ["Updated", "2m"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] uppercase text-slate-400">{k}</p>
                        <p className="font-display font-bold text-navy-900">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-navy-900/6 bg-navy-50/30 p-6 lg:border-l lg:border-t-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Health score
                </p>
                <p className="font-display text-5xl font-bold text-navy-900">78</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Canvas", "Validate", "Roadmap"].map((l) => (
                  <span
                    key={l}
                    className="rounded-xl border border-navy-900/8 bg-white/80 px-3 py-2 text-xs font-semibold text-navy-800"
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
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-navy-300">{label}</p>
      <p className="font-display text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function CanvasScene() {
  const blocks = [
    { title: "Validate the Problem", cat: "idea" as const, x: 40, y: 36, progress: 72, step: 1, color: "#081a3a", light: "#e8edf5" },
    { title: "Build MVP", cat: "product" as const, x: 340, y: 24, progress: 38, step: 2, color: "#2563eb", light: "#dbeafe" },
    { title: "Pricing & Revenue", cat: "finance" as const, x: 640, y: 48, progress: 20, step: 3, color: "#059669", light: "#d1fae5" },
    { title: "Go-to-Market", cat: "marketing" as const, x: 180, y: 260, progress: 15, step: 4, color: "#7c3aed", light: "#ede9fe" },
    { title: "Launch & Growth", cat: "launch" as const, x: 520, y: 280, progress: 8, step: 5, color: "#ea580c", light: "#ffedd5" },
  ];

  return (
    <div className="relative h-full min-h-[920px] canvas-workspace-flow">
      <div className="absolute inset-0 founder-grid opacity-50" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="demoFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4a78b4" />
            <stop offset="100%" stopColor="#7aa3d4" />
          </linearGradient>
        </defs>
        <path d="M 200 90 Q 280 60 380 70" fill="none" stroke="url(#demoFlow)" strokeWidth="2.5" className="demo-flow-path" />
        <path d="M 520 85 Q 580 70 680 95" fill="none" stroke="url(#demoFlow)" strokeWidth="2.5" className="demo-flow-path demo-flow-delay-1" />
        <path d="M 140 130 Q 160 200 220 280" fill="none" stroke="url(#demoFlow)" strokeWidth="2" strokeDasharray="6 4" className="demo-flow-path demo-flow-delay-2" />
        <path d="M 420 120 Q 480 200 580 310" fill="none" stroke="url(#demoFlow)" strokeWidth="2" strokeDasharray="6 4" className="demo-flow-path demo-flow-delay-3" />
      </svg>

      {blocks.map((block, i) => {
        const cat = CATEGORY_CONFIG[block.cat];
        return (
          <div
            key={block.title}
            className="demo-block absolute w-[240px] rounded-2xl border-2 p-4 shadow-xl"
            style={{
              left: block.x,
              top: block.y,
              borderColor: block.color,
              backgroundColor: block.light,
              animationDelay: `${i * 120}ms`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                style={{ backgroundColor: cat.minimap }}
              >
                {String(block.step).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold uppercase text-navy-500">{cat.shortLabel}</span>
            </div>
            <p className="mt-2 font-display text-sm font-bold text-navy-900">{block.title}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-900/10">
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
            <p className="mt-2 text-[10px] text-slate-500">4 tasks</p>
          </div>
        );
      })}

      <div className="demo-cursor absolute left-[300px] top-[100px] z-20">
        <div className="h-4 w-4 rounded-full border-2 border-navy-900 bg-white shadow-lg" />
      </div>

      <div className="absolute bottom-6 left-6 rounded-xl border border-navy-900/10 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
        <p className="text-xs font-bold text-navy-900">Interactive startup canvas</p>
        <p className="text-[11px] text-slate-500">Drag blocks · Connect flows · Track every task</p>
      </div>

      <div className="absolute bottom-6 right-6 h-24 w-36 overflow-hidden rounded-xl border border-navy-900/10 bg-navy-950/90 shadow-xl">
        <div className="border-b border-white/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-navy-300">
          Minimap
        </div>
        <div className="relative h-full p-2">
          {blocks.map((b) => (
            <span
              key={b.title}
              className="absolute h-2 w-3 rounded-sm"
              style={{ left: `${(b.x / 900) * 100}%`, top: `${(b.y / 400) * 100}%`, backgroundColor: b.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ValidatorScene() {
  return (
    <div className="min-h-[920px] p-8">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">AI Validator</p>
        <h2 className="font-display text-2xl font-bold text-navy-900">Startup readiness report</h2>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <AnimatedGauge value={78} label="Startup Readiness" sublabel="Strong idea" size={140} />
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3">
            {[
              ["Business Model", 74],
              ["Market", 82],
              ["Execution", 68],
              ["Competition", 61],
              ["Team", 55],
              ["Funding", 48],
            ].map(([label, val], i) => (
              <ScoreBar key={label as string} label={label as string} value={val as number} delay={i * 60} />
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-5 p-5" hover={false}>
        <p className="text-sm font-bold text-navy-900">AI recommendation</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Run 10 customer interviews this week. Your market score is strong but execution lag suggests
          tightening MVP scope around retention before adding AI features.
        </p>
      </GlassCard>
    </div>
  );
}

function RoadmapScene() {
  const cols = [
    { id: "now", label: "Now", sub: "In progress", items: ["Validate the Problem", "Landing page v1"] },
    { id: "next", label: "Next", sub: "Up next", items: ["Build MVP", "Pricing experiment"] },
    { id: "later", label: "Later", sub: "Queued", items: ["Launch ads", "Hire designer"] },
    { id: "done", label: "Completed", sub: "Shipped", items: ["Idea brief"] },
  ];

  return (
    <div className="min-h-[920px] p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Roadmap</p>
          <h2 className="font-display text-2xl font-bold text-navy-900">Execution sequence</h2>
        </div>
        <div className="rounded-full bg-navy-900/8 px-3 py-1 text-xs font-semibold text-navy-700">
          42% overall
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cols.map((col, ci) => (
          <div key={col.id} className="demo-rise rounded-2xl border border-navy-900/8 bg-white/80 p-3" style={{ animationDelay: `${ci * 100}ms` }}>
            <div className="mb-3">
              <p className="font-display text-sm font-bold text-navy-900">{col.label}</p>
              <p className="text-[10px] text-slate-400">{col.sub}</p>
            </div>
            <div className="space-y-2">
              {col.items.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-navy-900/6 bg-gradient-to-br from-white to-navy-50/40 p-3 shadow-sm"
                >
                  <p className="text-xs font-bold text-navy-900">{item}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-navy-900/8">
                    <div className="h-full w-2/3 rounded-full bg-navy-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
      "Focus on one wedge: busy professionals who want simple calorie tracking. Ship a 2-week MVP with manual food logging first — validate retention before adding AI features.";
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="flex min-h-[920px] gap-0">
      <div className="flex min-w-0 flex-1 flex-col p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900 shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">{ASSISTANT_NAME} Founder Coach</h2>
            <p className="text-sm text-slate-500">Strategy · PM · CTO in one panel</p>
          </div>
        </div>

        <GlassCard className="flex flex-1 flex-col p-5" hover={false}>
          <div className="flex-1 space-y-4">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-navy-900 px-4 py-3 text-sm text-white">
              What should I prioritize before launch?
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-navy-900/8 bg-navy-50 px-4 py-3 text-sm leading-relaxed text-navy-900">
              {typed}
              <span className="demo-cursor ml-0.5 inline-block h-4 w-0.5 bg-navy-700 align-middle" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 border-t border-navy-900/6 pt-4">
            {["Refine MVP", "Competitor scan", "CEO review"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-navy-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700"
              >
                {chip}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
