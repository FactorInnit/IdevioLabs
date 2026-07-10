"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  DollarSign,
  ListChecks,
  Loader2,
  Map,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { StatsBar } from "@/components/landing/StatsBar";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { CredibilityStrip } from "@/components/landing/CredibilityStrip";
import { AITrainingCredibility } from "@/components/landing/AITrainingCredibility";
import { Testimonials } from "@/components/landing/Testimonials";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { PricingSection } from "@/components/PricingSection";
import { UpgradeModal } from "@/components/UpgradeModal";
import { usePlan } from "@/lib/usePlan";
import { useAuth } from "@/lib/auth-context";
import { ASSISTANT_NAME, PRODUCT_NAME } from "@/lib/brand";
import { BETA_DISCLAIMER, BETA_JOIN_STEPS, BETA_LABEL } from "@/lib/beta";

function joinBetaHref(user: { id: string } | null): string {
  if (user) return "#get-started";
  return `/signup?next=${encodeURIComponent("/#get-started")}`;
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "Founder Operating System",
    text: "Land inside your company — not a chat window. Dashboard, workspace, finance, validator, and coach in one command center.",
  },
  {
    icon: Map,
    title: "Company Digital Twin",
    text: "Draggable modules connected with live flow lines. Business model → revenue → MVP → execution — all linked.",
  },
  {
    icon: DollarSign,
    title: "Budget & finance built in",
    text: "See allocation per block, recommended tools for your budget, runway, and a live revenue simulator.",
  },
  {
    icon: ListChecks,
    title: "Premium AI roadmap",
    text: "Phased kanban — Now, Next, Later, Done — with tasks, costs, and progress on every block.",
  },
  {
    icon: Bot,
    title: `${ASSISTANT_NAME} Founder Coach`,
    text: "Trained on 10,000+ founder & CEO playbooks plus YC resources — your PM, CTO, and strategist in one panel.",
  },
  {
    icon: Bell,
    title: "Daily habits & tracker",
    text: "Founder habit checklist with streaks. Stay accountable and ship something every day.",
  },
];

export function PromptHero() {
  const router = useRouter();
  const { user } = useAuth();
  const { plan } = usePlan();
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!user) {
      setProjectCount(0);
      return;
    }
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProjectCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setProjectCount(0));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Describe your startup idea to get started.");
      return;
    }

    if (!user) {
      router.push(`/signup?next=${encodeURIComponent("/#get-started")}`);
      return;
    }

    // Plan gating uses server-synced limits when available.
    const atProjectLimit =
      user.canCreateMore === false ||
      (plan.maxStartups !== Infinity && projectCount >= plan.maxStartups);

    if (atProjectLimit) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          budget: budget ? Number(budget) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === "plan_limit") {
          setShowUpgrade(true);
          return;
        }
        if (data.code === "auth_required") {
          router.push(`/signup?next=${encodeURIComponent("/#get-started")}`);
          return;
        }
        throw new Error(data.error || "Something went wrong.");
      }

      const project = await res.json();
      router.push(`/company/${project.id}?module=workspace`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden founder-bg">
        <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(15,36,68,0.16),_transparent_55%)]" />

        <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-700" />
                {BETA_LABEL} is live — not the final app
              </div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-200/80 bg-white/90 px-4 py-2 text-sm font-medium text-navy-800 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-navy-600" />
                The operating system for startups
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-navy-950 sm:text-5xl lg:text-[3.5rem]">
                Your startup&apos;s{" "}
                <span className="text-gradient-navy">command center</span>
                , not another chatbot
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
                {PRODUCT_NAME} is the AI Founder OS — roadmap, finances, recommended tools,
                validation scores, daily habits, and an integrated coach. Built on insights from
                10,000+ founders and YC-grade playbooks for advice you can actually trust.
              </p>

              <p className="mt-4 max-w-lg rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-950">
                {BETA_DISCLAIMER} {BETA_JOIN_STEPS}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={joinBetaHref(user)}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-800"
                >
                  Join beta
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3.5 text-sm font-semibold text-navy-900 transition hover:border-navy-400"
                >
                  About us
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["SC", "MW", "PS", "JO"].map((initials) => (
                      <div
                        key={initials}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-navy-800 text-[10px] font-bold text-white"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-navy-800 text-navy-800" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      4.9 · 2,100+ reviews
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800">
                  <Shield className="h-3.5 w-3.5 text-navy-600" />
                  Free during beta · No credit card
                </span>
              </div>
            </div>

            <div className="relative lg:pl-4">
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-navy-500/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-navy-900/15">
                <Image
                  src="/images/hero-3d.png"
                  alt={`${PRODUCT_NAME} startup roadmap dashboard`}
                  width={1024}
                  height={683}
                  priority
                  className="h-auto w-full"
                />
              </div>

              <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-950">{ASSISTANT_NAME}</p>
                  <p className="text-[10px] text-slate-500">Planning with you</p>
                </div>
              </div>

              <div className="absolute -right-3 top-6 hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Businesses launched
                </p>
                <p className="font-display text-lg font-bold text-navy-950">940+</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <StatsBar />
      <AITrainingCredibility />
      <CredibilityStrip />
      <TrustedBy />

      {/* Get started form — glassy box over a cool background */}
      <section
        id="get-started"
        className="relative scroll-mt-20 overflow-hidden bg-navy-950 py-24"
      >
        <Image
          src="/images/prompt-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none object-cover opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-navy-950/40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(90,122,184,0.25),_transparent_65%)]" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
              {BETA_LABEL}
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Create your account, then your first startup
            </h2>
            <p className="mt-3 text-white/70">
              Sign up free, describe your idea, and get a complete 8-block business plan with
              ordered tasks and tools — powered by AI trained on 10,000+ founders and YC-grade
              startup playbooks.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-300">
                  AI roadmap generator
                </p>
                <p className="mt-0.5 text-sm font-medium text-white">
                  Describe your startup vision
                </p>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 sm:flex">
                <CheckCircle2 className="h-3.5 w-3.5 text-navy-300" />
                <span className="text-[11px] font-medium text-white/70">
                  8,200+ generated this month
                </span>
              </div>
            </div>

            <div className="p-6">
              <label className="text-sm font-semibold text-white/90">
                What do you want to build?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A mobile app that connects local farmers directly with restaurants, handling orders and delivery logistics..."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-navy-300 focus:bg-white/10"
              />

              <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <DollarSign className="h-4 w-4 text-navy-300" />
                    Starting budget (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 outline-none transition focus:border-navy-300 focus:bg-white/10"
                  />
                  <p className="mt-1.5 text-xs text-white/50">
                    We&apos;ll only recommend tools that fit within this budget.
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 shadow-lg transition hover:bg-white/90 disabled:opacity-60 sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Building roadmap...
                      </>
                    ) : user ? (
                      <>
                        Create my startup
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Join beta — create account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-red-300">{error}</p>
              )}

              <p className="mt-4 text-center text-xs text-white/50">
                Free during public beta · No credit card · Pro &amp; Ultra coming later
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Product showcase */}
      <section className="border-t border-slate-200 bg-slate-100 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-navy-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-navy-900/15">
              <Image
                src="/images/showcase-3d.png"
                alt="Connected business workflow blocks"
                width={1024}
                height={683}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
              See it in action
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Your whole business,{" "}
              <span className="font-serif-accent font-normal text-navy-700">
                mapped clearly
              </span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {PRODUCT_NAME} connects every part of your startup into one visual map. Click any
              block to reveal an ordered checklist of exactly what to do — and the tools to
              do it with.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Step-by-step tasks in the right order",
                "Real tools, websites & software linked per step",
                "Budget-aware recommendations, always",
                `${ASSISTANT_NAME} on the side — makes changes as you plan`,
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-navy-700" />
                  <span className="text-sm font-medium text-navy-900">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={joinBetaHref(user)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Join beta
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
              Everything you need
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              One Founder OS for your entire journey
            </h2>
            <p className="mt-3 text-slate-600">
              Finance, roadmap, habits, validation, and AI — not scattered docs and generic chat.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="glass-card group rounded-2xl p-7"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 shadow-lg shadow-navy-900/25 transition group-hover:scale-105">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy-950">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CommunitySection />
      <HowItWorks />
      <Testimonials />

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
              Pricing · {BETA_LABEL}
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Free during beta. Paid plans coming soon.
            </h2>
            <p className="mt-3 text-slate-600">
              One free startup to test the Founder OS. Pro and Ultra are in development — register
              interest if you want early access when they launch.
            </p>
          </div>

          <div className="mt-12">
            <PricingSection onSelected={() => router.push("/#get-started")} />
          </div>
        </div>
      </section>

      <FinalCTA />

      <UpgradeModal
        open={showUpgrade}
        title="You've used your free startup"
        description="During beta, each account includes one startup on the Free plan. Pro plans (more startups + team features) are still in development."
        onClose={() => setShowUpgrade(false)}
        onUpgraded={() => setShowUpgrade(false)}
      />
    </>
  );
}
