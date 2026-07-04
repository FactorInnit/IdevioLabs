import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Lightbulb,
    title: "Showcase your idea",
    text: "Publish your startup profile, vision, and stage so the right people can discover what you're building.",
  },
  {
    icon: Users,
    title: "Find likeminded founders",
    text: "Meet peers who share your domain, energy, and ambition — swap feedback, ideas, and momentum.",
  },
  {
    icon: TrendingUp,
    title: "Funding without the VC gate",
    text: "Early-stage startups can connect with angels, operators, and everyday backers — not just traditional venture firms.",
  },
  {
    icon: Handshake,
    title: "Hire, scale & collaborate",
    text: "Reach early teammates, advisors, and partners who want to help you grow from idea to traction.",
  },
];

export function CommunitySection() {
  return (
    <section id="community" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-700">
                <Users className="h-3.5 w-3.5" />
                Founder Community
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Coming soon
              </span>
            </div>

            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Where founders publish, connect, and grow together
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              A community built for early-stage builders — display your startup, find likeminded
              people, and open doors to funding, hiring, and collaboration without needing a VC
              round to get started.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Small teams will be able to share their ideas publicly, get in touch with other
              founders, and attract support from people who believe in what they&apos;re building —
              whether that&apos;s capital, talent, or a co-building partner.
            </p>

            <Link
              href="/community"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-navy-900/10 bg-white px-5 py-3 text-sm font-semibold text-navy-800 shadow-sm transition hover:border-navy-400/30 hover:bg-navy-50"
            >
              Preview the community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="glass-card rounded-2xl border border-slate-200/80 bg-white p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 shadow-lg shadow-navy-900/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-base font-bold text-navy-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
