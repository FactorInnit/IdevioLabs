"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Flame,
  Map,
  Pause,
  Play,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { ASSISTANT_NAME, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    id: "command",
    label: "Command Center",
    icon: Sparkles,
    caption: "Your portfolio, health scores, and next moves in one cockpit.",
  },
  {
    id: "canvas",
    label: "Company Canvas",
    icon: Workflow,
    caption: "A live digital twin — every block connected to your plan.",
  },
  {
    id: "validator",
    label: "AI Validator",
    icon: Shield,
    caption: "YC-grade validation scores across market, model, and execution.",
  },
  {
    id: "roadmap",
    label: "Execution Roadmap",
    icon: Map,
    caption: "Phased tasks with costs, progress, and what to ship next.",
  },
  {
    id: "coach",
    label: "Founder Coach",
    icon: Bot,
    caption: "Your AI strategist — trained on 10,000+ founder playbooks.",
  },
] as const;

const SCENE_MS = 4800;

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
        setScene((current) => (current + 1) % SCENES.length);
        setProgress(0);
      }
    }, 50);

    return () => window.clearInterval(tick);
  }, [playing, scene]);

  const active = SCENES[scene];

  return (
    <section id="demo" className="scroll-mt-20 border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
            Product demo
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Watch the {PRODUCT_NAME} Founder OS in action
          </h2>
          <p className="mt-3 text-slate-600">
            Auto-playing walkthrough — from idea to command center, canvas, validation, and
            execution.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-navy-500/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100 shadow-2xl shadow-navy-900/15">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
                ideviolabs.com/dashboard
              </div>
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-navy-800 transition hover:bg-slate-50"
                aria-label={playing ? "Pause demo" : "Play demo"}
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="h-1 bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-navy-800 to-navy-500 transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="relative aspect-[16/10] bg-[#f6f8fb]">
              {SCENES.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    index === scene ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                  aria-hidden={index !== scene}
                >
                  {item.id === "command" && <CommandCenterScene />}
                  {item.id === "canvas" && <CanvasScene />}
                  {item.id === "validator" && <ValidatorScene />}
                  {item.id === "roadmap" && <RoadmapScene />}
                  {item.id === "coach" && <CoachScene active={index === scene} />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    index === scene
                      ? "border-navy-800 bg-navy-900 text-white shadow-lg shadow-navy-900/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-navy-300 hover:text-navy-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">{active.caption}</p>
        </div>
      </div>
    </section>
  );
}

function CommandCenterScene() {
  return (
    <div className="flex h-full">
      <aside className="hidden w-44 shrink-0 border-r border-navy-900/6 bg-white/90 p-3 sm:block">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Founder OS
        </p>
        {["Command Center", "Daily Motivation", "Founder Brief", "Community"].map((item, i) => (
          <div
            key={item}
            className={cn(
              "mb-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold",
              i === 0 ? "bg-navy-900/8 text-navy-800" : "text-slate-500"
            )}
          >
            {item}
          </div>
        ))}
      </aside>

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4 text-white sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-300">
            Founder Command Center
          </p>
          <h3 className="mt-2 font-display text-lg font-bold sm:text-xl">
            Good morning, <span className="text-navy-200">Alex</span>
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Health", value: "78" },
              { label: "Progress", value: "42%" },
              { label: "Launch prob.", value: "61%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 px-2 py-2 sm:px-3">
                <p className="text-[9px] uppercase tracking-wide text-navy-300">{stat.label}</p>
                <p className="font-display text-base font-bold sm:text-lg">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-rise mt-3 rounded-2xl border border-navy-900/8 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-900 to-navy-600 text-sm font-bold text-white">
              C
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                  Building
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                  <TrendingUp className="mr-0.5 inline h-3 w-3" />
                  61% launch prob.
                </span>
              </div>
              <p className="mt-1 font-display text-sm font-bold text-navy-900 sm:text-base">
                CalorieTrack
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-400">Progress</p>
                  <p className="font-bold text-navy-900">42%</p>
                </div>
                <div>
                  <p className="text-slate-400">Valuation</p>
                  <p className="font-bold text-navy-900">$240K</p>
                </div>
                <div>
                  <p className="text-slate-400">Next</p>
                  <p className="font-bold text-navy-900">Validate MVP</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-900/8">
                <div
                  className="demo-fill h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-500"
                  style={{ "--demo-target": "42%" } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasScene() {
  const nodes = [
    { label: "Business Model", x: "8%", y: "18%", delay: "0ms" },
    { label: "MVP Build", x: "38%", y: "12%", delay: "200ms" },
    { label: "Go-to-Market", x: "68%", y: "22%", delay: "400ms" },
    { label: "Revenue", x: "22%", y: "58%", delay: "600ms" },
    { label: "Operations", x: "58%", y: "62%", delay: "800ms" },
  ];

  return (
    <div className="relative h-full overflow-hidden bg-[#eef2f7]">
      <div className="absolute inset-0 founder-grid opacity-60" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <line x1="18%" y1="28%" x2="44%" y2="22%" className="demo-line" />
        <line x1="48%" y1="22%" x2="74%" y2="30%" className="demo-line demo-line-delayed" />
        <line x1="28%" y1="34%" x2="32%" y2="58%" className="demo-line demo-line-delayed-2" />
        <line x1="52%" y1="30%" x2="62%" y2="58%" className="demo-line demo-line-delayed-3" />
      </svg>
      {nodes.map((node) => (
        <div
          key={node.label}
          className="demo-node absolute w-[28%] max-w-[140px] rounded-xl border border-navy-900/10 bg-white p-2.5 shadow-lg shadow-navy-900/10 sm:p-3"
          style={{ left: node.x, top: node.y, animationDelay: node.delay }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wide text-navy-500">Block</p>
          <p className="mt-0.5 text-[11px] font-bold text-navy-900 sm:text-xs">{node.label}</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-navy-900/8">
            <div
              className="demo-fill h-full rounded-full bg-navy-600"
              style={{ "--demo-target": "65%" } as React.CSSProperties}
            />
          </div>
        </div>
      ))}
      <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-medium text-navy-800 shadow-sm">
        Drag blocks · Connect flows · Track progress
      </div>
    </div>
  );
}

function ValidatorScene() {
  const bars = [
    { label: "Market", value: 82 },
    { label: "Business model", value: 74 },
    { label: "Execution", value: 68 },
    { label: "Competition", value: 61 },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:flex-row sm:p-5">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-900/8 bg-white p-4 sm:w-44">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#1a4478"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="264"
              className="demo-gauge"
            />
          </svg>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-navy-900">78</p>
            <p className="text-[10px] text-slate-500">Score</p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-navy-800">Strong idea</p>
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border border-navy-900/8 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-navy-700" />
          <p className="text-sm font-bold text-navy-900">AI Validator Report</p>
        </div>
        <div className="space-y-3">
          {bars.map((bar, index) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="font-medium text-slate-600">{bar.label}</span>
                <span className="font-bold text-navy-900">{bar.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-navy-900/8">
                <div
                  className="demo-bar h-full rounded-full bg-gradient-to-r from-navy-800 to-navy-500"
                  style={
                    {
                      animationDelay: `${index * 120}ms`,
                      "--demo-target": `${bar.value}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <p className="demo-rise mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] leading-relaxed text-emerald-800">
          Recommendation: Run 10 customer interviews this week, then tighten MVP scope around
          retention.
        </p>
      </div>
    </div>
  );
}

function RoadmapScene() {
  const columns = [
    { title: "Now", tasks: ["Validate problem", "Landing page"], tone: "bg-navy-900 text-white" },
    { title: "Next", tasks: ["Build MVP", "Pricing test"], tone: "bg-navy-100 text-navy-800" },
    { title: "Later", tasks: ["Launch ads", "Hire designer"], tone: "bg-slate-100 text-slate-700" },
    { title: "Done", tasks: ["Idea brief"], tone: "bg-emerald-50 text-emerald-800" },
  ];

  return (
    <div className="h-full p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-navy-900">Execution Roadmap</p>
          <p className="text-[11px] text-slate-500">Sequence what to ship — with costs & tasks</p>
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-navy-900/8 px-2 py-1 text-[10px] font-semibold text-navy-700 sm:flex">
          <Flame className="h-3 w-3" />
          4 tasks this week
        </div>
      </div>
      <div className="grid h-[calc(100%-2.5rem)] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {columns.map((column, columnIndex) => (
          <div
            key={column.title}
            className="demo-rise rounded-xl border border-navy-900/8 bg-white p-2 sm:p-2.5"
            style={{ animationDelay: `${columnIndex * 100}ms` }}
          >
            <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", column.tone)}>
              {column.title}
            </span>
            <div className="mt-2 space-y-1.5">
              {column.tasks.map((task) => (
                <div
                  key={task}
                  className="rounded-lg border border-navy-900/6 bg-[#f8fafc] px-2 py-1.5 text-[10px] font-medium text-navy-900"
                >
                  {task}
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
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setTyped(full.slice(0, index));
      if (index >= full.length) window.clearInterval(id);
    }, 18);

    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="flex h-full gap-3 p-4 sm:p-5">
      <div className="hidden w-36 shrink-0 rounded-2xl border border-navy-900/8 bg-white p-3 sm:block">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Modules</p>
        <div className="mt-2 space-y-1">
          {["Canvas", "Validator", "Competitors", "Roadmap"].map((item) => (
            <div key={item} className="rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border border-navy-900/8 bg-white p-4">
        <div className="mb-4 flex items-center gap-2 border-b border-navy-900/6 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-900">{ASSISTANT_NAME} Founder Coach</p>
            <p className="text-[10px] text-slate-500">Strategy · PM · CTO in one panel</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-navy-900 px-3 py-2 text-[11px] leading-relaxed text-white">
            What should I prioritize before launch?
          </div>
          <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-navy-50 px-3 py-2 text-[11px] leading-relaxed text-navy-900">
            {typed}
            <span className="demo-cursor ml-0.5 inline-block h-3 w-0.5 bg-navy-700 align-middle" />
          </div>
        </div>

        <div className="demo-rise mt-4 flex flex-wrap gap-2">
          {["Refine MVP", "Competitor scan", "Weekly CEO review"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-navy-900/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-navy-700"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden w-28 shrink-0 flex-col gap-2 lg:flex">
        <div className="rounded-xl border border-navy-900/8 bg-white p-2 text-center">
          <Swords className="mx-auto h-4 w-4 text-navy-600" />
          <p className="mt-1 text-[10px] font-semibold text-navy-800">Compete</p>
        </div>
        <div className="rounded-xl border border-navy-900/8 bg-white p-2 text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-emerald-600" />
          <p className="mt-1 text-[10px] font-semibold text-navy-800">Finance</p>
        </div>
      </div>
    </div>
  );
}
