"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import {
  defaultVisionHint,
  loadCompanyVision,
  saveCompanyVision,
} from "@/lib/company-vision";
import { cn } from "@/lib/utils";

export function CompanyVisionQuote({
  projectId,
  projectName,
  description,
}: {
  projectId: string;
  projectName: string;
  description?: string | null;
}) {
  const [vision, setVision] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hint = defaultVisionHint(projectName, description);

  useEffect(() => {
    setVision(loadCompanyVision(projectId));
  }, [projectId]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    setVision(next);
    saveCompanyVision(projectId, next);
    setEditing(false);
  };

  const startEdit = () => {
    setDraft(vision || hint);
    setEditing(true);
  };

  return (
    <div className="mt-5">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Startup vision
      </p>

      {editing ? (
        <div className="relative">
          <span className="pointer-events-none absolute -left-1 -top-3 font-serif text-4xl leading-none text-navy-300/70">
            &ldquo;
          </span>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") setEditing(false);
            }}
            rows={4}
            className="w-full resize-none rounded-xl border border-navy-400/25 bg-white/90 px-4 py-3 pl-5 font-serif text-sm italic leading-relaxed text-navy-900 shadow-inner outline-none ring-navy-400/30 focus:ring-2"
            placeholder="Type your north-star vision…"
          />
          <span className="pointer-events-none absolute -bottom-2 right-1 font-serif text-4xl leading-none text-navy-300/70">
            &rdquo;
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="group/vision relative w-full rounded-xl border border-dashed border-navy-900/10 bg-gradient-to-br from-white/80 to-navy-50/40 px-4 py-4 text-left transition hover:border-navy-400/30 hover:bg-white"
        >
          <span className="pointer-events-none absolute left-2 top-1 font-serif text-3xl leading-none text-navy-300/80">
            &ldquo;
          </span>
          <span className="pointer-events-none absolute bottom-0 right-2 font-serif text-3xl leading-none text-navy-300/80">
            &rdquo;
          </span>
          <p
            className={cn(
              "relative z-10 px-3 font-serif text-[15px] italic leading-relaxed",
              vision ? "text-navy-900" : "text-slate-400"
            )}
          >
            {vision || hint}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-navy-500/70 opacity-0 transition group-hover/vision:opacity-100">
            <Pencil className="h-3 w-3" />
            Click to edit
          </span>
        </button>
      )}
    </div>
  );
}
