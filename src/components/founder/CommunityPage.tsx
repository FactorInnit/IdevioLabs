"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Handshake,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { GlassCard } from "@/components/founder/GlassCard";
import { StreakBadge } from "@/components/founder/StreakBadge";
import { PRODUCT_NAME } from "@/lib/brand";

const PLANNED_FEATURES = [
  {
    icon: Rocket,
    title: "Publish your startup",
    description:
      "Share your company profile, vision, and stage so other founders can discover what you're building.",
  },
  {
    icon: Handshake,
    title: "Connect & collaborate",
    description:
      "Find co-founders, advisors, and peers who want to swap ideas, feedback, and momentum.",
  },
  {
    icon: TrendingUp,
    title: "Funding intros",
    description:
      "Signal what you're raising and connect with angels, operators, and founders who can help.",
  },
  {
    icon: Briefcase,
    title: "Hiring & scaling",
    description:
      "Reach early teammates, contractors, and operators who want to join a startup in motion.",
  },
];

export function CommunityPage() {
  return (
    <FounderShell>
      <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-navy-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Command Center
            </Link>

            <div className="mt-6 mb-4 inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-navy-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-700">
              <Users className="h-3.5 w-3.5" />
              Founder Community
            </div>

            <h1 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              Where founders meet, share, and build together
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              A place to publish your startups, get in touch with other founders, and find help with
              funding, hiring, scaling, and collaboration — all inside {PRODUCT_NAME}.
            </p>
          </div>
          <StreakBadge />
        </div>

        <GlassCard className="relative overflow-hidden p-10 text-center sm:p-14" hover={false}>
          <div className="pointer-events-none absolute inset-0 founder-grid opacity-40" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-500 shadow-lg shadow-navy-900/25">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Coming soon
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              The founder community is on the way
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
              Soon you&apos;ll be able to list your startup publicly, explore what others are
              building, and connect around funding, hiring, scaling, and shared ideas.
            </p>
          </div>
        </GlassCard>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PLANNED_FEATURES.map((feature) => (
            <GlassCard key={feature.title} className="p-6" hover={false}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/8 text-navy-700">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Coming soon
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </FounderShell>
  );
}
