import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { PricingSection } from "@/components/PricingSection";
import { BETA_DISCLAIMER, BETA_LABEL } from "@/lib/beta";
import {
  FREE_AI_MESSAGES_PER_MONTH,
  FREE_VALIDATOR_RUNS_PER_MONTH,
} from "@/lib/usage-constants";

const FAQS = [
  {
    q: "Is the Free plan really free?",
    a: "Yes. You get one full startup roadmap — canvas, validator, finance, roadmap, and team chat — with no credit card required.",
  },
  {
    q: "What's included on Free vs Pro?",
    a: "Free includes your first company, basic AI coach usage, and core workspace tools. Pro unlocks daily habits, competitor intelligence, weekly CEO review, investor PDF exports, unlimited AI coach chats, unlimited validator runs, and up to 10 companies.",
  },
  {
    q: "What are the Free plan usage limits?",
    a: `Free includes ${FREE_AI_MESSAGES_PER_MONTH} AI coach messages and ${FREE_VALIDATOR_RUNS_PER_MONTH} validator deep report per month. Your dashboard shows remaining usage. Pro removes these caps.`,
  },
  {
    q: "What happens when I hit a Free limit?",
    a: "You'll see an upgrade prompt in the app. You can still use everything else on Free — only that limit resets next month (or unlocks immediately on Pro).",
  },
  {
    q: "What do collaborators get?",
    a: "Free includes 1 teammate. Pro supports up to 5 collaborators with edit or view-only access. Ultra is unlimited.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Paid plans are month-to-month. Cancel before your next billing date to avoid future charges. See our Refund Policy for details.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-navy-950 py-20">
          <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(90,122,184,0.25),_transparent_60%)]" />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200">
              {BETA_LABEL} · Paid plans in development
            </span>
            <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Plans that grow{" "}
              <span className="text-gradient-light">with your startup</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              Start free with one roadmap during beta. Pro and Ultra unlock habits, competitors,
              CEO review, and more — register interest while we finish building them.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/45">
              {BETA_DISCLAIMER}
            </p>
          </div>
        </section>

        <section className="relative -mt-10 pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <PricingSection />
            <p className="mt-8 text-center text-sm leading-relaxed text-slate-500">
              Pro and Ultra are not available during public beta. See our{" "}
              <Link href="/terms" className="font-semibold text-navy-700 hover:underline">
                Terms
              </Link>
              ,{" "}
              <Link href="/refunds" className="font-semibold text-navy-700 hover:underline">
                Refund Policy
              </Link>
              , and{" "}
              <Link href="/privacy" className="font-semibold text-navy-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-center text-3xl font-bold tracking-tight text-navy-950">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-4">
              {FAQS.map((f) => (
                <div
                  key={f.q}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="font-semibold text-navy-950">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-navy-950 px-8 py-10 text-center">
              <h3 className="font-display text-2xl font-bold text-white">
                Ready to join the beta?
              </h3>
              <p className="max-w-md text-sm text-white/60">
                Create a free account and build your first startup roadmap — no credit card required.
              </p>
              <Link
                href={`/signup?next=${encodeURIComponent("/#get-started")}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-white/90"
              >
                Join beta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
