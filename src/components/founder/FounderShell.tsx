"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, Crown, Lock, Newspaper, Sparkles, Users, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { StreakBadge } from "@/components/founder/StreakBadge";
import { UsageLimitsPanel } from "@/components/founder/UsageLimitsPanel";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/usePlan";
import {
  FOUNDER_NAV_FREE,
  FOUNDER_NAV_PRO,
  type FounderModuleId,
  companyModuleHref,
} from "@/lib/founder-nav";
import { canAccessProFeature } from "@/lib/plan-access";
import { PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface FounderShellProps {
  companyId?: string;
  companyName?: string;
  children: React.ReactNode;
}

export function FounderShell({ companyId, companyName, children }: FounderShellProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { user } = useAuth();
  const { plan, planId } = usePlan();
  const activeModule = (params.get("module") as FounderModuleId) || "workspace";
  const isDashboard = pathname === "/dashboard";
  const isMotivation = pathname === "/motivation";
  const isNewsletter = pathname === "/newsletter";
  const isCommunity = pathname === "/community";
  const isPortfolioNav = isDashboard || isMotivation || isNewsletter || isCommunity;
  const isPricing = pathname === "/pricing";
  const showUpgrade = planId !== "ultra";
  const hasProAccess = canAccessProFeature(planId);

  function renderNavItem(item: (typeof FOUNDER_NAV_FREE)[number] | (typeof FOUNDER_NAV_PRO)[number]) {
    const href = companyId ? companyModuleHref(companyId, item.id) : "/dashboard";
    const active = activeModule === item.id;
    const Icon = item.icon;
    const locked = item.proOnly && !hasProAccess;

    return (
      <Link
        key={item.id}
        href={href}
        className={cn(
          "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
          active
            ? "sidebar-item-active font-semibold text-navy-900"
            : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800",
          locked && !active && "opacity-80"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active && "text-navy-600")} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {locked && <Lock className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />}
      </Link>
    );
  }

  return (
    <div className="founder-bg flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-navy-900/6 bg-white/80 backdrop-blur-2xl shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-navy-900/5 px-5 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div>
              <span className="font-display text-sm font-bold text-navy-900">
                {PRODUCT_NAME}
              </span>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Founder OS
              </p>
            </div>
          </Link>
        </div>

        {companyId && companyName && (
          <div className="border-b border-navy-900/5 px-4 py-3">
            <Link
              href="/dashboard"
              className="mb-2 flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-navy-700"
            >
              <ChevronLeft className="h-3 w-3" />
              All companies
            </Link>
            <p className="truncate font-display text-sm font-semibold text-navy-900">
              {companyName}
            </p>
            <p className="text-[10px] text-slate-400">Company Digital Twin</p>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {isPortfolioNav ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isDashboard
                    ? "sidebar-item-active font-semibold text-navy-900"
                    : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800"
                )}
              >
                <Sparkles className={cn("h-4 w-4 shrink-0", isDashboard && "text-navy-600")} />
                Command Center
              </Link>
              <Link
                href="/motivation"
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isMotivation
                    ? "sidebar-item-active font-semibold text-navy-900"
                    : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800"
                )}
              >
                <Zap className={cn("h-4 w-4 shrink-0", isMotivation && "text-navy-600")} />
                Daily Motivation
              </Link>
              <Link
                href="/newsletter"
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isNewsletter
                    ? "sidebar-item-active font-semibold text-navy-900"
                    : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800"
                )}
              >
                <Newspaper className={cn("h-4 w-4 shrink-0", isNewsletter && "text-navy-600")} />
                Founder Brief
              </Link>
              <Link
                href="/community"
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isCommunity
                    ? "sidebar-item-active font-semibold text-navy-900"
                    : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800"
                )}
              >
                <Users className={cn("h-4 w-4 shrink-0", isCommunity && "text-navy-600")} />
                <span className="min-w-0 flex-1 truncate">Community</span>
                <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">
                  Soon
                </span>
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isPricing
                    ? "sidebar-item-active font-semibold text-navy-900"
                    : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800"
                )}
              >
                <Crown className={cn("h-4 w-4 shrink-0", isPricing && "text-navy-600")} />
                {showUpgrade ? "Upgrade plan" : "Plans & billing"}
              </Link>
              {user && planId === "free" && (
                <div className="mt-3 px-1">
                  <UsageLimitsPanel planId={planId} compact />
                </div>
              )}
            </>
          ) : (
            <>
              {FOUNDER_NAV_FREE.map(renderNavItem)}
              <div className="my-3 px-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Pro features
                </p>
              </div>
              {FOUNDER_NAV_PRO.map(renderNavItem)}
            </>
          )}
        </nav>

        {user && planId === "free" && !isPortfolioNav && (
          <div className="px-3 pb-2">
            <UsageLimitsPanel planId={planId} compact />
          </div>
        )}

        {user && showUpgrade && (
          <div className="px-3 pb-3">
            <Link
              href="/pricing"
              className="block rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 p-4 text-white shadow-lg shadow-navy-900/20 transition hover:from-navy-800 hover:to-navy-700"
            >
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-semibold">Upgrade plan</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/75">
                {planId === "free"
                  ? "Unlock habits, competitors, CEO review, exports, and unlimited AI."
                  : "Go Ultra for unlimited companies and collaborators."}
              </p>
              <span className="mt-3 inline-flex text-[11px] font-semibold text-amber-200">
                View pricing →
              </span>
            </Link>
          </div>
        )}

        {user && (
          <div className="border-t border-navy-900/5 p-4">
            <div className="mb-3 flex justify-center">
              <StreakBadge compact />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white">
                {user.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-navy-900">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {plan.name}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[9px] text-slate-300">
              build {process.env.NEXT_PUBLIC_BUILD_SHA}
            </p>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="ml-[252px] min-h-screen flex-1">{children}</main>
    </div>
  );
}
