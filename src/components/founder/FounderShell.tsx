"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/usePlan";
import { FOUNDER_NAV, type FounderModuleId, companyModuleHref } from "@/lib/founder-nav";
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
  const { plan } = usePlan();
  const activeModule = (params.get("module") as FounderModuleId) || "workspace";
  const isDashboard = pathname === "/dashboard";

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
          {isDashboard ? (
            <Link
              href="/dashboard"
              className="sidebar-item-active flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-900"
            >
              <Sparkles className="h-4 w-4 text-navy-600" />
              Command Center
            </Link>
          ) : (
            FOUNDER_NAV.map((item) => {
              const href = companyId
                ? companyModuleHref(companyId, item.id)
                : "/dashboard";
              const active = activeModule === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={cn(
                    "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    active
                      ? "sidebar-item-active font-semibold text-navy-900"
                      : "font-medium text-slate-500 hover:bg-white/60 hover:text-navy-800"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active && "text-navy-600")} />
                  {item.label}
                </Link>
              );
            })
          )}
        </nav>

        {user && (
          <div className="border-t border-navy-900/5 p-4">
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
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="ml-[252px] min-h-screen flex-1">{children}</main>
    </div>
  );
}
