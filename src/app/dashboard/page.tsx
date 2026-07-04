"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { CommandCenter } from "@/components/founder/CommandCenter";
import { GlassCard } from "@/components/founder/GlassCard";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/usePlan";
import { computeCompanyMetrics } from "@/lib/founder-metrics";

interface ProjectSummary {
  id: string;
  name: string;
  logoUrl?: string | null;
  description: string | null;
  progress: number;
  budget: number | null;
  updatedAt: string;
  nodes: { id: string; progress: number; category: string }[];
  isOwner?: boolean;
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
  const [loadError, setLoadError] = useState("");
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
    setLoadError("");
    fetch("/api/projects")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : "Could not load your companies."
          );
        }
        if (!Array.isArray(data)) {
          throw new Error("Could not load your companies.");
        }
        setProjects(data);
      })
      .catch((err) => {
        setProjects([]);
        setLoadError(
          err instanceof Error
            ? err.message
            : "Could not load your companies. Try refreshing."
        );
      })
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
          projects.reduce((s, p) => s + computeCompanyMetrics(p).healthScore, 0) /
            projects.length
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
      {loadError && !loading && (
        <div className="mx-auto max-w-7xl px-8 pt-6">
          <GlassCard className="border-amber-200/60 bg-amber-50/90 px-5 py-4 text-sm text-amber-950">
            <p className="font-semibold">We couldn&apos;t load your companies</p>
            <p className="mt-1">{loadError}</p>
            <p className="mt-2 text-xs text-amber-900/80">
              Your data is not deleted — this is usually a database sync issue after a deploy. If
              you manage Turso, run the latest migrations, then refresh.
            </p>
          </GlassCard>
        </div>
      )}

      {checkoutMessage && (
        <div className="mx-auto max-w-7xl px-8 pt-6">
          <GlassCard className="border-emerald-200/50 bg-emerald-50/80 px-5 py-4 text-sm font-medium text-emerald-800">
            {checkoutMessage}
          </GlassCard>
        </div>
      )}

      {atLimit && !loading && user && planId === "free" && (
        <div className="mx-auto max-w-7xl px-8 pt-6">
          <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-5">
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
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-navy-700" />
        </div>
      ) : (
        <CommandCenter
          firstName={firstName}
          planName={plan.name}
          planId={planId}
          projects={projects}
          avgHealth={avgHealth}
          onNewCompany={handleNew}
          onDeleteCompany={(projectId) =>
            setProjects((prev) => prev.filter((p) => p.id !== projectId))
          }
        />
      )}

      <p className="pb-8 text-center text-xs text-slate-400">
        Last synced {formatDistanceToNow(new Date(), { addSuffix: true })}
      </p>

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
