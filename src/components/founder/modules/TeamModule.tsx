"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Loader2,
  Mail,
  Send,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/lib/project-access";

interface TeamMessage {
  id: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string;
  expiresAt: string;
  inviteUrl?: string;
}

interface TeamLimits {
  planId: string;
  max: number;
  used: number;
  remaining: number;
  canInvite: boolean;
}

interface TeamPayload {
  messages: TeamMessage[];
  owner?: { id: string; name: string; email: string; role: "owner" };
  members?: TeamMember[];
  invites?: PendingInvite[];
  limits?: TeamLimits;
  dbReady?: boolean;
  access?: {
    role: string | null;
    canManageTeam: boolean;
    canInvite: boolean;
  };
}

function formatLimit(max: number): string {
  return max === Infinity ? "Unlimited" : String(max);
}

export function TeamModule({
  projectId,
  projectName,
  isOwner = false,
}: {
  projectId: string;
  projectName: string;
  isOwner?: boolean;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [owner, setOwner] = useState<TeamPayload["owner"]>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [limits, setLimits] = useState<TeamLimits | null>(null);
  const [canManageTeam, setCanManageTeam] = useState(isOwner);
  const [canInvite, setCanInvite] = useState(false);
  const [dbReady, setDbReady] = useState(true);
  const [text, setText] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("editor");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${projectId}/team`);
      const data = (await res.json()) as TeamPayload;
      if (res.ok) {
        setMessages(data.messages ?? []);
        setOwner(data.owner);
        setMembers(data.members ?? []);
        setInvites(data.invites ?? []);
        setLimits(data.limits ?? null);
        setDbReady(data.dbReady !== false);
        setCanManageTeam(isOwner || Boolean(data.access?.canManageTeam));
        setCanInvite(Boolean(data.access?.canInvite));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [projectId, isOwner]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setTeamError("");
    try {
      const res = await fetch(`/api/company/${projectId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message", message: text.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setText("");
      } else {
        setTeamError(data.error ?? "Failed to send message.");
      }
    } finally {
      setSending(false);
    }
  };

  const invite = async () => {
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    setTeamError("");
    setTeamSuccess("");
    try {
      const res = await fetch(`/api/company/${projectId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTeamError(data.error ?? "Failed to send invite.");
        return;
      }
      setInviteEmail("");
      if (data.emailSent) {
        setTeamSuccess(
          `Invite email sent to ${data.invite.email}. They must sign up with that exact email.`
        );
      } else {
        setTeamSuccess(
          `Invite created for ${data.invite.email}. ${data.emailError ?? "Email could not be sent."} Share this link: ${data.inviteUrl}`
        );
      }
      await load();
    } finally {
      setInviting(false);
    }
  };

  const teamAction = async (payload: Record<string, string>) => {
    setTeamError("");
    setTeamSuccess("");
    const res = await fetch(`/api/company/${projectId}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setTeamError(data.error ?? "Action failed.");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-5" hover={false}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/8">
            <Users className="h-6 w-6 text-navy-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-navy-900">
              {projectName} — Team workspace
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Invite co-founders by email, assign edit or view-only access, and chat together in
              real time.
            </p>
            {limits && (
              <p className="mt-2 text-xs font-semibold text-navy-700">
                Collaborators: {limits.used} / {formatLimit(limits.max)} used on your{" "}
                {limits.planId} plan
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {!dbReady && canManageTeam && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">One-time database setup for team invites</p>
          <p className="mt-1">
            In Turso → <strong>idevio</strong> → <strong>Edit Data</strong>, run the team migration
            SQL file, then refresh this page.
          </p>
        </div>
      )}

      {canManageTeam && (
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-navy-700" />
            <h3 className="font-display font-bold text-navy-900">Invite teammate</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Free plan: 1 collaborator · Pro: 5 · Ultra: unlimited. We email them a branded invite
            to join this workspace.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@email.com"
                disabled={!dbReady}
                className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-3 text-sm disabled:bg-slate-50"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              disabled={!dbReady}
              className="rounded-xl border border-navy-900/10 px-3 py-2.5 text-sm disabled:bg-slate-50"
            >
              <option value="editor">Can edit</option>
              <option value="viewer">View only</option>
            </select>
            <button
              onClick={invite}
              disabled={inviting || !inviteEmail.trim() || !canInvite || !dbReady}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send invite
            </button>
          </div>

          {!dbReady && (
            <p className="mt-3 text-xs font-medium text-amber-700">
              Complete the Turso migration above before sending invites.
            </p>
          )}

          {dbReady && !canInvite && limits && (
            <p className="mt-3 text-xs font-medium text-amber-700">
              You&apos;ve reached your collaborator limit.{" "}
              <Link href="/pricing" className="underline">
                Upgrade your plan
              </Link>{" "}
              to invite more people.
            </p>
          )}
        </GlassCard>
      )}

      {canManageTeam && dbReady && (members.length > 0 || invites.length > 0 || owner) && (
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display font-bold text-navy-900">People on this workspace</h3>
          <div className="mt-4 space-y-3">
            {owner && (
              <div className="flex items-center justify-between rounded-xl bg-navy-900/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-navy-900">{owner.name}</p>
                  <p className="text-xs text-slate-500">{owner.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  <Crown className="h-3 w-3" />
                  Owner
                </span>
              </div>
            )}

            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-xl border border-navy-900/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-navy-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      teamAction({
                        action: "update_role",
                        memberId: member.id,
                        role: e.target.value,
                      })
                    }
                    className="rounded-lg border border-navy-900/10 px-2 py-1.5 text-xs"
                  >
                    <option value="editor">Can edit</option>
                    <option value="viewer">View only</option>
                  </select>
                  <button
                    onClick={() =>
                      teamAction({ action: "remove_member", memberId: member.id })
                    }
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    aria-label="Remove teammate"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {invites.map((pending) => (
              <div
                key={pending.id}
                className="rounded-xl border border-dashed border-navy-900/15 px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{pending.email}</p>
                    <p className="text-xs text-slate-500">
                      Invite pending · {pending.role === "editor" ? "Can edit" : "View only"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      teamAction({ action: "revoke_invite", inviteId: pending.id })
                    }
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Revoke
                  </button>
                </div>
                {pending.inviteUrl && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="flex-1 truncate rounded-lg bg-navy-900/5 px-3 py-2 text-[11px] text-navy-800">
                      {pending.inviteUrl}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(pending.inviteUrl ?? "");
                        setTeamSuccess(`Copied invite link for ${pending.email}.`);
                        setTeamError("");
                      }}
                      className="rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Copy link
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {(teamError || teamSuccess) && (
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            teamError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          )}
        >
          {teamError || teamSuccess}
        </div>
      )}

      <GlassCard className="flex h-[520px] flex-col p-0" hover={false}>
        <div className="border-b border-navy-900/6 px-5 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            {messages.length} message{messages.length !== 1 ? "s" : ""} · auto-refreshes
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No messages yet. Say hello to your team!
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isMe = user?.name === m.userName;
                return (
                  <div
                    key={m.id}
                    className={cn("flex", isMe ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5",
                        isMe ? "bg-navy-900 text-white" : "bg-navy-900/8 text-navy-900"
                      )}
                    >
                      {!isMe && (
                        <p className="mb-0.5 text-[10px] font-bold opacity-70">{m.userName}</p>
                      )}
                      <p className="text-sm leading-relaxed">{m.message}</p>
                      <p
                        className={cn(
                          "mt-1 text-[9px]",
                          isMe ? "text-white/60" : "text-slate-400"
                        )}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-navy-900/6 p-4">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Message your team…"
              className="flex-1 rounded-xl border border-navy-900/10 px-4 py-2.5 text-sm"
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
