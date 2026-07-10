"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import type { PlanId } from "@/lib/plans";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface BetaUpgradeInterestModalProps {
  open: boolean;
  onClose: () => void;
  planId?: PlanId;
  title?: string;
  description?: string;
}

export function BetaUpgradeInterestModal({
  open,
  onClose,
  planId = "pro",
  title = "Pro & Ultra are coming soon",
  description = "Paid plans are still in development during our public beta. Leave your details and we'll reach out when upgrades go live.",
}: BetaUpgradeInterestModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setName((prev) => prev || user.name || "");
    setEmail((prev) => prev || user.email || "");
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  useEffect(() => {
    if (!open) {
      setError("");
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const planLabel = planId === "ultra" ? "Ultra" : "Pro";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const fullPhone = `${countryCode.trim()} ${trimmedPhone}`.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setError("Please fill in your name, phone, and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/beta/upgrade-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          name: trimmedName,
          phone: fullPhone,
          email: trimmedEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not submit your details.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative border-b border-slate-100 bg-navy-950 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="pr-8">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Beta · {planLabel} in development
              </p>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center">
              <p className="text-sm leading-relaxed text-slate-600">
                Thanks — we&apos;ve got your details. We&apos;ll email you when {planLabel} upgrades
                open during beta.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                Back to app
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-slate-600">{description}</p>
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                Pro and Ultra features are not available yet — no payment will be taken. This form
                only registers your interest.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-navy-900">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900">Phone (with country code)</label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      placeholder="+971"
                      className="w-24 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="50 123 4567"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy-900">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-800",
                    loading && "opacity-70"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Notify me when upgrades open"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
