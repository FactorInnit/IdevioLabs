"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Shield, Sparkles, Users } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { PRODUCT_NAME } from "@/lib/brand";

interface InviteDetails {
  projectId: string;
  projectName: string;
  email: string;
  role: "editor" | "viewer";
  inviterName: string;
  expiresAt: string;
}

export default function InvitePage({ token }: { token: string }) {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invite not found.");
        setInvite(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not accept invite.");
      await refresh();
      router.replace(data.redirect ?? `/company/${data.projectId}?module=team`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept invite.");
    } finally {
      setAccepting(false);
    }
  };

  const next = `/invite/${token}`;

  return (
    <div className="min-h-screen founder-bg">
      <AppHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center">
        <Logo size="lg" className="mb-6" />

        {loading ? (
          <Loader2 className="h-10 w-10 animate-spin text-navy-700" />
        ) : error && !invite ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
            <h1 className="font-display text-2xl font-bold text-red-900">Invite unavailable</h1>
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-800"
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : invite ? (
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-navy-900/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900">
              <Users className="h-7 w-7 text-white" />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Workspace invite
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold text-navy-900">
              Join {invite.projectName}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              <strong className="text-navy-900">{invite.inviterName}</strong> invited{" "}
              <strong className="text-navy-900">{invite.email}</strong> to collaborate on{" "}
              {PRODUCT_NAME}.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your access
              </p>
              <p className="mt-1 font-display text-lg font-bold text-navy-900">
                {invite.role === "editor" ? "Can edit" : "View only"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {invite.role === "editor"
                  ? "You can update the roadmap, tasks, and workspace modules."
                  : "You can view the workspace and join team chat without editing."}
              </p>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            {!user ? (
              <div className="mt-8 space-y-3">
                <p className="text-sm text-slate-600">
                  Create an account with <strong>{invite.email}</strong> to accept this invite.
                </p>
                <Link
                  href={`/signup?next=${encodeURIComponent(next)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Create account
                </Link>
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-navy-900"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : user.email.toLowerCase() !== invite.email.toLowerCase() ? (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                You&apos;re signed in as <strong>{user.email}</strong>, but this invite was sent to{" "}
                <strong>{invite.email}</strong>. Sign out and sign in with the invited email.
              </div>
            ) : (
              <button
                onClick={accept}
                disabled={accepting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {accepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                Accept invite & enter workspace
              </button>
            )}
          </div>
        ) : null}
      </main>
      <AppFooter />
    </div>
  );
}
