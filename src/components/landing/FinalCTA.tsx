import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(90,122,184,0.15),_transparent_70%)]" />
      <div className="cta-orb pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-navy-600/20 blur-3xl" />
      <div className="cta-orb pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Logo size="xl" className="mx-auto mb-6 shadow-2xl" />
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your startup deserves a real plan
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/60">
          Join 12,400+ founders who turned vague ideas into actionable roadmaps.
          Free to start — no credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-white/90"
          >
            Build my roadmap
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            View my startups
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/40">
          Trusted by 940+ businesses · 4.9★ average rating · Setup in under 2 minutes
        </p>
      </div>
    </section>
  );
}
