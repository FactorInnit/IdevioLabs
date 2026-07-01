import Link from "next/link";
import { Logo } from "@/components/Logo";
import { COMPANY_NAME, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";

export function AppFooter() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <span className="text-sm font-semibold text-white">{PRODUCT_NAME}</span>
            <p className="text-[10px] text-navy-400">{PRODUCT_TAGLINE}</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm text-navy-400">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
        </div>
        <p className="text-xs text-navy-500">
          © {new Date().getFullYear()} {COMPANY_NAME}. Built for founders.
        </p>
      </div>
    </footer>
  );
}
