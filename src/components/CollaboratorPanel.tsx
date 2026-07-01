"use client";

import { useEffect, useState } from "react";
import { Crown, Mail, Plus, Trash2, Users } from "lucide-react";
import { usePlan } from "@/lib/usePlan";
import { UpgradeModal } from "./UpgradeModal";
import { cn } from "@/lib/utils";

interface Collaborator {
  email: string;
  role: "editor" | "viewer";
}

export function CollaboratorPanel({ projectId }: { projectId: string }) {
  const { plan } = usePlan();
  const canCollaborate = plan.collaborators;

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const storageKey = `launchpad_collab_${projectId}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setCollaborators(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const persist = (next: Collaborator[]) => {
    setCollaborators(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const invite = () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    if (collaborators.some((c) => c.email === trimmed)) {
      setEmail("");
      return;
    }
    if (collaborators.length >= plan.maxCollaborators) return;
    persist([...collaborators, { email: trimmed, role: "editor" }]);
    setEmail("");
  };

  const remove = (target: string) => {
    persist(collaborators.filter((c) => c.email !== target));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-navy-950">
              Collaborators
              <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-700">
                <Crown className="h-3 w-3" /> Pro
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Invite your team to work on this roadmap together
            </p>
          </div>
        </div>
      </div>

      {canCollaborate ? (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && invite()}
                type="email"
                placeholder="teammate@email.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
              />
            </div>
            <button
              onClick={invite}
              className="flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              <Plus className="h-4 w-4" />
              Invite
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            {collaborators.length} of{" "}
            {plan.maxCollaborators === Infinity ? "unlimited" : plan.maxCollaborators}{" "}
            seats used
          </p>

          <div className="mt-4 space-y-2">
            {collaborators.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500">
                No collaborators yet. Invite your co-founder or team.
              </p>
            ) : (
              collaborators.map((c) => (
                <div
                  key={c.email}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold uppercase text-white">
                      {c.email[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-950">{c.email}</p>
                      <p className="text-[11px] capitalize text-slate-400">{c.role} · invited</p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(c.email)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-navy-950">
            Team collaboration is a Pro feature
          </h4>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
            Upgrade to Pro to invite up to 5 teammates to build this roadmap with you,
            or Ultra for unlimited collaborators.
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            )}
          >
            <Crown className="h-4 w-4" />
            Upgrade to invite your team
          </button>
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        title="Invite your team with Pro"
        description="Collaboration is available on Pro and Ultra plans."
        onClose={() => setShowUpgrade(false)}
        onUpgraded={() => setShowUpgrade(false)}
      />
    </div>
  );
}
