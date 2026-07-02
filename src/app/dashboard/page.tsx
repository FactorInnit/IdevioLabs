"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Plus, Sparkles, Sun } from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { CompanyCard } from "@/components/founder/CompanyCard";
import { GlassCard } from "@/components/founder/GlassCard";
import { AnimatedGauge } from "@/components/founder/AnimatedGauge";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/usePlan";
import { computeCompanyMetrics } from "@/lib/founder-metrics";

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes: { id: string; progress: number; category: string }[];
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center founder-bg">
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
    refresh();
  }, [refresh]);

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
        if (sessionId) await syncCheckoutSession(sessionId);
        await refresh();
      })();
    }
  }, [params, refresh, syncCheckoutSession]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const maxStartups =
    user?.maxStartups ?? (plan.maxStartups === Infinity ? Infinity : plan.maxStartups);
  const atLimit =
    user?.canCreateMore === false ||
    (maxStartups !== Infinity && projects.length >= maxStartups);

  const avgHealth =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (s, p) => s + computeCompanyMetrics(p).healthScore,
            0
          ) / projects.length
        )
      : 0;

  const handleNew = () => {
    if (!user) {
      router.push("/login?next=/dashboard");
      return;
    }
    if (atLimit) setShowUpgrade(true);
    else router.push("/#get-started");
  };

  const firstName = user?.name?.split(" ")[0] ?? "Founder";

  return (
    <FounderShell>
        <div className="mx-auto max-w-6xl px-8 py-12">
        {/* Greeting */}
        <header className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            Founder Command Center
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-navy-900">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-slate-500">
            Your companies, metrics, and priorities — all in one place.
          </p>
        </header>

        {checkoutMessage && (
          <GlassCard className="mb-6 border-emerald-200/50 bg-emerald-50/80 px-5 py-4 text-sm font-medium text-emerald-800">
            {checkoutMessage}
          </GlassCard>
        )}

        {/* Live metrics + CEO strip */}
        <div className="mb-10 grid gap-4 lg:grid-cols-4">
          <GlassCard className="flex flex-col items-center justify-center p-6 lg:col-span-1">
            <AnimatedGauge
              value={avgHealth || 72}
              label="Portfolio Health"
              size={120}
            />
          </GlassCard>

          <GlassCard className="p-6 lg:col-span-3">
            <div className="flex items-center gap-2 text-navy-800">
              <Sun className="h-5 w-5" />
              <h2 className="font-display font-semibold">Daily CEO Dashboard</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Companies", value: projects.length },
                { label: "Avg Progress", value: projects.length ? `${Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)}%` : "—" },
                { label: "Plan", value: plan.name },
                { label: "Launch Prob.", value: projects.length ? `${computeCompanyMetrics(projects[0]).launchProbability}%` : "—" },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{m.label}</p>
                  <p className="font-display text-2xl font-bold text-navy-900">{m.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-semibold text-navy-900">Today&apos;s priority:</span>{" "}
              {projects[0]
                ? computeCompanyMetrics(projects[0]).nextMilestone
                : "Create your first company to get started."}
            </p>
          </GlassCard>
        </div>

        {/* My Companies */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-900">My Companies</h2>
            <p className="text-sm text-slate-500">Each company has a live digital twin</p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800"
          >
            <Plus className="h-4 w-4" />
            New company
          </button>
        </div>

        {atLimit && !loading && user && planId === "free" && (
          <GlassCard className="mb-6 flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-navy-800">
              Free plan: {projects.length} of {maxStartups} company used.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Upgrade
            </button>
          </GlassCard>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
          </div>
        ) : projects.length === 0 ? (
          <GlassCard className="flex flex-col items-center py-24 text-center">
            <Sparkles className="mb-4 h-10 w-10 text-navy-400" />
            <h3 className="font-display text-xl font-bold text-navy-900">No companies yet</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Describe your startup idea and Idevio builds your Company Digital Twin.
            </p>
            <Link
              href="/#get-started"
              className="mt-6 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white"
            >
              Create your first company
            </Link>
          </GlassCard>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((p) => (
              <CompanyCard key={p.id} {...p} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Last synced {formatDistanceToNow(new Date(), { addSuffix: true })}
        </p>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgraded={() => {
          setShowUpgrade(false);
          refresh();
        }}
      />
    </FounderShell>
  );
}
