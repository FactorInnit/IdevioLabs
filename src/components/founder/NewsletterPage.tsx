"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Globe,
  Loader2,
  Mail,
  Newspaper,
  Quote,
  Sparkles,
} from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { GlassCard } from "@/components/founder/GlassCard";
import { StreakBadge } from "@/components/founder/StreakBadge";
import {
  FOUNDER_NEWSLETTERS,
  getFeaturedNewsletter,
  NEWSLETTER_TAG_COLORS,
  type NewsletterEdition,
} from "@/lib/founder-newsletter";
import { PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

function NewsletterContent() {
  const featured = getFeaturedNewsletter();
  const [active, setActive] = useState<NewsletterEdition>(featured);

  return (
    <FounderShell>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Command Center
            </Link>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-navy-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-700">
              <Newspaper className="h-3.5 w-3.5" />
              Founder Brief
            </div>
            <h1 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
              Weekly CEO &amp; founder newsletter
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Curated playbooks, CEO letters, and what matters in startups and business this week —
              built for operators using {PRODUCT_NAME}.
            </p>
          </div>
          <StreakBadge />
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Editions
            </p>
            {FOUNDER_NEWSLETTERS.map((edition) => (
              <button
                key={edition.id}
                onClick={() => setActive(edition)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left transition",
                  active.id === edition.id
                    ? "border-navy-400/40 bg-navy-900/5 shadow-sm"
                    : "border-transparent hover:border-navy-900/10 hover:bg-white/80"
                )}
              >
                <p className="text-[10px] font-semibold uppercase text-navy-500">
                  {edition.weekLabel}
                </p>
                <p className="mt-1 text-xs font-semibold leading-snug text-navy-900">
                  {edition.headline}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">{edition.readMinutes} min read</p>
              </button>
            ))}
          </aside>

          <div className="space-y-6">
            <GlassCard className="overflow-hidden p-0" hover={false}>
              <div className="border-b border-navy-900/8 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-6 py-8 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-300">
                  {active.weekLabel} · {active.readMinutes} min read
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                  {active.headline}
                </h2>
              </div>

              <div className="space-y-8 p-6">
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-navy-600" />
                    <h3 className="font-display text-lg font-bold text-navy-900">
                      {active.ceoLetter.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{active.ceoLetter.body}</p>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-navy-600" />
                    <h3 className="font-display text-lg font-bold text-navy-900">
                      {active.founderPlaybook.title}
                    </h3>
                  </div>
                  <ol className="space-y-2">
                    {active.founderPlaybook.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-xl border border-navy-900/6 bg-navy-900/[0.03] px-4 py-3 text-sm text-slate-700"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-navy-600" />
                    <h3 className="font-display text-lg font-bold text-navy-900">
                      Startup &amp; business brief
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {active.worldBriefs.map((brief) => (
                      <div
                        key={brief.title}
                        className="rounded-xl border border-navy-900/8 bg-white p-4 shadow-sm"
                      >
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            NEWSLETTER_TAG_COLORS[brief.tag]
                          )}
                        >
                          {brief.tag}
                        </span>
                        <h4 className="mt-2 font-semibold text-navy-900">{brief.title}</h4>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {brief.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-dashed border-navy-900/15 bg-gradient-to-br from-navy-50/80 to-white px-5 py-5">
                  <Quote className="mb-2 h-5 w-5 text-navy-400" />
                  <p className="font-serif text-base italic leading-relaxed text-navy-900">
                    &ldquo;{active.quote.text}&rdquo;
                  </p>
                  <p className="mt-3 text-xs font-semibold text-navy-700">
                    {active.quote.author}
                    <span className="font-normal text-slate-500"> · {active.quote.role}</span>
                  </p>
                </section>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-5" hover={false}>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-navy-500" />
                <div>
                  <p className="font-semibold text-navy-900">New edition every Monday</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Apply one playbook item to your roadmap or habits today — consistency beats
                    intensity.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Back to Command Center
              </Link>
            </GlassCard>
          </div>
        </div>
      </div>
    </FounderShell>
  );
}

export function NewsletterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center founder-bg">
          <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
        </div>
      }
    >
      <NewsletterContent />
    </Suspense>
  );
}
