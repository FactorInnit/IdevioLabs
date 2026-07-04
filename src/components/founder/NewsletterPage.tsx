"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
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
  TrendingUp,
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

const BRIEF_THUMBNAILS = [
  "/images/hero-3d.png",
  "/images/showcase-3d.png",
  "/images/prompt-bg.png",
  "/images/idevio-logo.png",
];

function NewsletterContent() {
  const featured = getFeaturedNewsletter();
  const [active, setActive] = useState<NewsletterEdition>(featured);
  const [digestStatus, setDigestStatus] = useState("");

  const sendDigest = async () => {
    setDigestStatus("Sending…");
    try {
      const res = await fetch("/api/digest/weekly", { method: "POST" });
      const data = await res.json();
      setDigestStatus(res.ok ? "Digest sent to your email." : data.error ?? "Could not send.");
    } catch {
      setDigestStatus("Could not send digest.");
    }
  };

  return (
    <FounderShell>
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        {/* Header */}
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
              <Newspaper className="h-3.5 w-3.5" />
              Founder Brief
            </div>

            <h1 className="font-display text-3xl font-bold text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              Weekly CEO &amp; founder newsletter
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
              Curated playbooks, CEO letters, and what matters in startups and business this week —
              built for operators using {PRODUCT_NAME}.
            </p>
          </div>
          <StreakBadge />
        </div>

        {/* Stats strip */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Editions", value: String(FOUNDER_NEWSLETTERS.length) },
            { label: "This week", value: `${active.readMinutes} min read` },
            { label: "Briefs", value: String(active.worldBriefs.length) },
            { label: "Playbook items", value: String(active.founderPlaybook.items.length) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-navy-900/8 bg-white/80 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-navy-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-12">
          {/* Editions sidebar */}
          <aside className="xl:col-span-3">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Editions
            </p>
            <div className="space-y-2">
              {FOUNDER_NEWSLETTERS.map((edition) => (
                <button
                  key={edition.id}
                  onClick={() => setActive(edition)}
                  className={cn(
                    "w-full overflow-hidden rounded-2xl border text-left transition",
                    active.id === edition.id
                      ? "border-navy-400/40 bg-white shadow-md shadow-navy-900/5"
                      : "border-navy-900/8 bg-white/70 hover:border-navy-900/15 hover:bg-white"
                  )}
                >
                  <div className="relative h-20 w-full">
                    <Image
                      src={edition.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
                    <p className="absolute bottom-2 left-3 text-[10px] font-semibold uppercase text-white/90">
                      {edition.weekLabel}
                    </p>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-xs font-semibold leading-snug text-navy-900">
                      {edition.headline}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {edition.readMinutes} min read
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <GlassCard className="mt-6 hidden p-4 xl:block" hover={false}>
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={active.sectionImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operator note
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Pick one playbook item and apply it inside your company workspace today.
              </p>
            </GlassCard>
          </aside>

          {/* Main article */}
          <div className="space-y-6 xl:col-span-6">
            <GlassCard className="overflow-hidden p-0" hover={false}>
              <div className="relative min-h-[220px] border-b border-navy-900/8 sm:min-h-[280px]">
                <Image
                  src={active.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1280px) 100vw, 720px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-900/40" />
                <div className="relative flex h-full min-h-[220px] flex-col justify-end px-6 py-8 sm:min-h-[280px] sm:px-10 sm:py-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-300">
                    {active.weekLabel} · {active.readMinutes} min read
                  </p>
                  <h2 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
                    {active.headline}
                  </h2>
                </div>
              </div>

              <div className="space-y-10 p-6 sm:p-8 lg:p-10">
                <section className="grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-navy-600" />
                      <h3 className="font-display text-lg font-bold text-navy-900">
                        {active.ceoLetter.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                      {active.ceoLetter.body}
                    </p>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-navy-900/8 shadow-lg shadow-navy-900/10 lg:aspect-square">
                    <Image
                      src={active.sectionImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="240px"
                    />
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-navy-600" />
                    <h3 className="font-display text-lg font-bold text-navy-900">
                      {active.founderPlaybook.title}
                    </h3>
                  </div>
                  <ol className="grid gap-3 md:grid-cols-2">
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
                    {active.worldBriefs.map((brief, i) => (
                      <div
                        key={brief.title}
                        className="overflow-hidden rounded-xl border border-navy-900/8 bg-white shadow-sm"
                      >
                        <div className="relative h-28">
                          <Image
                            src={BRIEF_THUMBNAILS[i % BRIEF_THUMBNAILS.length]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="320px"
                          />
                          <div className="absolute inset-0 bg-navy-950/30" />
                          <span
                            className={cn(
                              "absolute left-3 top-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                              NEWSLETTER_TAG_COLORS[brief.tag]
                            )}
                          >
                            {brief.tag}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-navy-900">{brief.title}</h4>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600">
                            {brief.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-6 rounded-2xl border border-dashed border-navy-900/15 bg-gradient-to-br from-navy-50/80 to-white px-5 py-6 sm:grid-cols-[1fr_180px] sm:items-center">
                  <div>
                    <Quote className="mb-2 h-5 w-5 text-navy-400" />
                    <p className="font-serif text-lg italic leading-relaxed text-navy-900">
                      &ldquo;{active.quote.text}&rdquo;
                    </p>
                    <p className="mt-3 text-xs font-semibold text-navy-700">
                      {active.quote.author}
                      <span className="font-normal text-slate-500"> · {active.quote.role}</span>
                    </p>
                  </div>
                  <div className="relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-2xl border border-navy-900/10">
                    <Image
                      src="/images/idevio-logo.png"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                </section>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-5 lg:p-6" hover={false}>
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={sendDigest}
                  className="inline-flex rounded-xl border border-navy-900/15 bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-50"
                >
                  Email me my weekly digest
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
                >
                  Back to Command Center
                </Link>
              </div>
              {digestStatus && (
                <p className="mt-3 w-full text-sm text-slate-600">{digestStatus}</p>
              )}
            </GlassCard>
          </div>

          {/* Right rail */}
          <aside className="space-y-6 xl:col-span-3">
            <GlassCard className="overflow-hidden p-0" hover={false}>
              <div className="relative h-40">
                <Image
                  src={active.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-navy-950/50" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <TrendingUp className="mb-2 h-5 w-5 text-white" />
                  <p className="text-sm font-semibold text-white">Trending for founders</p>
                </div>
              </div>
              <ul className="space-y-3 p-5">
                {active.worldBriefs.slice(0, 3).map((brief) => (
                  <li key={brief.title} className="border-b border-navy-900/6 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-navy-900">{brief.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                      {brief.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5" hover={false}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Visual digest
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {BRIEF_THUMBNAILS.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border border-navy-900/8"
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="160px" />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5 xl:hidden" hover={false}>
              <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl">
                <Image src={active.sectionImage} alt="" fill className="object-cover" sizes="400px" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Open your company workspace and turn one checklist item into progress on the canvas.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex text-sm font-semibold text-navy-700 hover:text-navy-900"
              >
                Go to Command Center →
              </Link>
            </GlassCard>
          </aside>
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
