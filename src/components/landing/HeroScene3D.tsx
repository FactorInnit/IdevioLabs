"use client";

export function HeroScene3D() {
  return (
    <div className="scene-3d relative mx-auto h-[420px] w-full max-w-lg lg:h-[480px]">
      <div className="scene-3d-inner absolute inset-0 flex items-center justify-center">
        <div className="float-card-main relative" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute -inset-8 rounded-full bg-navy-500/20 blur-3xl" />

          <div className="relative w-[320px] rounded-2xl border border-white/10 bg-navy-950 p-4 shadow-2xl shadow-black/50">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                Roadmap preview
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Idea", progress: 100 },
                { label: "Product", progress: 75 },
                { label: "Marketing", progress: 40 },
                { label: "Finance", progress: 60 },
              ].map((block) => (
                <div
                  key={block.label}
                  className="rounded-lg border border-white/10 bg-navy-800/80 p-3 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                    {block.label}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${block.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-white/50">{block.progress}%</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="text-[11px] text-white/60">Overall progress</span>
              <span className="text-sm font-bold text-white">68%</span>
            </div>
          </div>

          <div className="float-card-side absolute -right-8 top-8 w-36 rounded-xl border border-white/10 bg-white p-3 shadow-xl">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Tools
            </p>
            <div className="mt-2 space-y-1">
              {["Figma", "Stripe", "Notion"].map((t) => (
                <div
                  key={t}
                  className="rounded border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-medium text-navy-900"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="float-card-side absolute -left-10 bottom-4 w-32 rounded-xl border border-navy-400/30 bg-navy-800 p-3 shadow-xl">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-navy-400">
              Budget
            </p>
            <p className="mt-1 text-lg font-bold text-white">$5,000</p>
            <p className="text-[10px] text-white/50">Bootstrap tier</p>
          </div>

          <div className="float-orb absolute -top-6 right-12 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-navy-600 to-navy-900 shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
        {["Discovery", "Build", "Launch"].map((phase) => (
          <div
            key={phase}
            className="rounded-full border border-navy-200 bg-white/90 px-3 py-1 text-[10px] font-semibold text-navy-800 shadow-sm backdrop-blur-sm"
          >
            {phase}
          </div>
        ))}
      </div>
    </div>
  );
}
