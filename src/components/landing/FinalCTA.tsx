import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BETA_DISCLAIMER, BETA_LABEL } from "@/lib/beta";

export function FinalCTA() {
  const joinBetaHref = `/signup?next=${encodeURIComponent("/#get-started")}`;

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(90,122,184,0.15),_transparent_70%)]" />
      <div className="cta-orb pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-navy-600/20 blur-3xl" />
      <div className="cta-orb pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Logo size="xl" className="mx-auto mb-6 shadow-2xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
          {BETA_LABEL} is live
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Join the beta and build your first startup
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/60">
          Create a free account, describe your idea, and get an actionable roadmap in minutes.
          {BETA_DISCLAIMER}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={joinBetaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-white/90"
          >
            Join beta
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            View my startups
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/40">
          Free during beta · No credit card · Setup in under 2 minutes
        </p>
      </div>
    </section>
  );
}
