import Link from "next/link";
import { Logo } from "@/components/Logo";
import { COMPANY_NAME, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";
import { SUPPORT_EMAIL } from "@/lib/site";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
] as const;

export function AppFooter() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <span className="text-sm font-semibold text-white">{PRODUCT_NAME}</span>
              <p className="text-[10px] text-navy-400">{PRODUCT_TAGLINE}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-navy-800 pt-6 text-xs text-navy-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. Built for founders.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="transition hover:text-navy-300">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
