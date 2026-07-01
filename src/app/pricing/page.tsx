import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { PricingSection } from "@/components/PricingSection";

const FAQS = [
  {
    q: "Is the Free plan really free?",
    a: "Yes. You can create and fully build one startup roadmap for free, forever — no credit card required.",
  },
  {
    q: "What happens when I hit the Free limit?",
    a: "The Free plan includes 1 startup. To create more, or to invite collaborators, upgrade to Pro or Ultra.",
  },
  {
    q: "What do collaborators get?",
    a: "On Pro, you can invite up to 5 teammates to view and edit a roadmap with you. Ultra unlocks unlimited collaborators.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Plans are month-to-month and you can downgrade or cancel whenever you like.",
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
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
              Simple, founder-friendly pricing
            </span>
            <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Plans that grow{" "}
              <span className="text-gradient-light">with your startup</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              Start free with one roadmap. Upgrade when you&apos;re ready to build
              more startups or bring your team along.
            </p>
          </div>
        </section>

        <section className="relative -mt-10 pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <PricingSection />
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4 text-navy-600" />
              Demo mode — selecting a plan activates it instantly, no payment required.
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
                Ready to build your roadmap?
              </h3>
              <p className="max-w-md text-sm text-white/60">
                Join 12,400+ founders planning smarter with Idevio.
              </p>
              <Link
                href="/#get-started"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 transition hover:bg-white/90"
              >
                Start free
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
