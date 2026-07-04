"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/usePlan";
import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { plan } = usePlan();
  const isPaid = plan.id !== "free";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <span className="font-display text-base font-bold tracking-tight text-white">
              {PRODUCT_NAME}
            </span>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-navy-400">
              by {COMPANY_NAME}
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5">
          <ThemeToggle variant="header" className="mr-1" />
          <Link
            href="/pricing"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            My Startups
          </Link>
          <Link
            href="/about"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            About Us
          </Link>

          {loading ? (
            <div className="ml-2 h-9 w-24 animate-pulse rounded-lg bg-white/10" />
          ) : user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition hover:bg-white/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold uppercase text-navy-900">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden text-sm font-medium text-white sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <span
                  className={cn(
                    "hidden items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:inline-flex",
                    isPaid ? "bg-white text-navy-900" : "bg-white/10 text-white/70"
                  )}
                >
                  {isPaid && <Crown className="h-2.5 w-2.5" />}
                  {plan.name}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-navy-950">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-navy-900 transition hover:bg-slate-50"
                    >
                      My startups
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-navy-900 transition hover:bg-slate-50"
                    >
                      Manage plan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-1 rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-white/90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
