import Link from "next/link";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { LEGAL, LEGAL_LAST_UPDATED, type LegalSection } from "@/lib/legal";

interface LegalDocumentProps {
  title: string;
  description: string;
  sections: LegalSection[];
  relatedLinks?: { href: string; label: string }[];
}

export function LegalDocument({
  title,
  description,
  sections,
  relatedLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/refunds", label: "Refund Policy" },
  ],
}: LegalDocumentProps) {
  return (
    <div className="min-h-screen founder-bg">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-navy-900">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Last updated: {LEGAL_LAST_UPDATED} · {LEGAL.companyName} ·{" "}
          <a href={`mailto:${LEGAL.supportEmail}`} className="text-navy-700 hover:underline">
            {LEGAL.supportEmail}
          </a>
        </p>
        <p className="mt-6 text-base leading-relaxed text-slate-600">{description}</p>

        <nav className="mt-8 flex flex-wrap gap-3">
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-navy-800 transition hover:border-navy-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <article className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-display text-xl font-bold text-navy-900">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </article>

        <p className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-relaxed text-amber-950">
          This document is provided for transparency and operational clarity. It is not legal
          advice. Consider having a qualified attorney review these policies for your jurisdiction
          before launching paid subscriptions at scale.
        </p>
      </main>
      <AppFooter />
    </div>
  );
}
