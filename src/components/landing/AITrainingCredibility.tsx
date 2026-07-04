import { BookOpen, Bot, Brain, GraduationCap } from "lucide-react";
import { AI_TRAINING_SOURCES } from "@/lib/marketing";
import { ASSISTANT_NAME, PRODUCT_NAME } from "@/lib/brand";

const SOURCE_ICONS = [Brain, GraduationCap, BookOpen, Bot];

export function AITrainingCredibility() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 py-16">
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-[0.06]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-navy-400/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-300">
              Founder-grade intelligence
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              AI trained on how the best{" "}
              <span className="font-serif-accent font-normal text-navy-200">actually build</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-100/90">
              {PRODUCT_NAME}&apos;s AI coach and planning algorithms aren&apos;t generic chatbot
              replies — they&apos;re shaped by insights from{" "}
              <strong className="font-semibold text-white">10,000+ CEOs and startup founders</strong>
              , Y Combinator resources, accelerator playbooks, and leading operator content. That
              means your roadmap, validator scores, and {ASSISTANT_NAME} advice reflect patterns
              from companies that have raised, launched, and scaled for real.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["YC Startup School", "Founder playbooks", "PMF frameworks", "Fundraising ops"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-navy-100"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {AI_TRAINING_SOURCES.map((source, i) => {
              const Icon = SOURCE_ICONS[i] ?? Brain;
              return (
                <div
                  key={source.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.09]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-navy-200" />
                  </div>
                  <p className="font-display text-sm font-bold text-white">{source.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-navy-200/80">
                    {source.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
