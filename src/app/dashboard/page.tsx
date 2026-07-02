"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Crown, Loader2, Plus } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/usePlan";
import { formatCurrency } from "@/lib/utils";

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes: { id: string }[];
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, refresh, syncCheckoutSession } = useAuth();
  const { plan, planId } = usePlan();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    if (params.get("checkout") === "success") {
      const planName = params.get("plan");
      setCheckoutMessage(
        planName
          ? `Payment successful! Your ${planName.toUpperCase()} plan is now active.`
          : "Payment successful! Your plan is now active."
      );

      const sessionId = params.get("session_id");
      (async () => {
        if (sessionId) {
          await syncCheckoutSession(sessionId);
        }
        await refresh();
      })();
    }
    if (params.get("signed_in") === "1") {
      refresh();
    }
  }, [params, refresh, syncCheckoutSession]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const maxStartups =
    user?.maxStartups ??
    (plan.maxStartups === Infinity ? Infinity : plan.maxStartups);

  const atLimit =
    user?.canCreateMore === false ||
    (maxStartups !== Infinity && projects.length >= maxStartups);

  const showUpgradeBanner =
    atLimit && !loading && user && planId !== "ultra";

  const handleNew = () => {
    if (!user) {
      router.push("/login?next=/#get-started");
      return;
    }
    if (atLimit) {
      setShowUpgrade(true);
    } else {
      router.push("/#get-started");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Portfolio
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-navy-950">My startups</h1>
            <p className="mt-1 text-slate-600">
              Track all your business roadmaps in one place.
            </p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            <Plus className="h-4 w-4" />
            New startup
          </button>
        </div>

        {checkoutMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
            {checkoutMessage}
          </div>
        )}

        {showUpgradeBanner && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-200 bg-navy-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-950">
                  You&apos;re on the {plan.name} plan
                </p>
                <p className="text-xs text-slate-600">
                  You&apos;ve used {projects.length} of{" "}
                  {maxStartups === Infinity ? "unlimited" : maxStartups} startup
                  {maxStartups === 1 ? "" : "s"}. Upgrade to build more.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Upgrade
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Logo size="xl" className="mx-auto mb-4 opacity-90" />
            <h2 className="text-lg font-semibold text-navy-950">No startups yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Describe your idea on the home page to generate your first roadmap.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:underline"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-navy-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-navy-950 group-hover:text-navy-700">
                      {project.name}
                    </h2>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {project.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      Updated{" "}
                      {formatDistanceToNow(new Date(project.updatedAt), {
                        addSuffix: true,
                      })}
                      · {project.nodes.length} workflow blocks
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-navy-600" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                      <span>Progress</span>
                      <span className="text-navy-800">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-navy-800 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  {project.budget != null && (
                    <span className="rounded-lg border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-800">
                      Budget: {formatCurrency(project.budget)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <UpgradeModal
        open={showUpgrade}
        title={
          planId === "pro"
            ? "Upgrade to Ultra for unlimited startups"
            : "Upgrade to build more startups"
        }
        description={
          planId === "pro"
            ? `You've used ${projects.length} of ${maxStartups} startups on Pro. Go Ultra for unlimited roadmaps.`
            : `The ${plan.name} plan includes ${maxStartups === Infinity ? "unlimited" : maxStartups} startup${maxStartups === 1 ? "" : "s"}. Choose a plan to keep building.`
        }
        onClose={() => setShowUpgrade(false)}
        onUpgraded={() => {
          setShowUpgrade(false);
          refresh();
        }}
      />
    </div>
  );
}
