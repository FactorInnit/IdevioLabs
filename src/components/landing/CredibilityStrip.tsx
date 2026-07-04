export function CredibilityStrip() {
  const badges = [
    { label: "10,000+ founder insights", sub: "CEO & operator playbooks" },
    { label: "YC-informed AI", sub: "Startup School & library patterns" },
    { label: "No lock-in", sub: "Export anytime" },
    { label: "2 min setup", sub: "Start immediately" },
  ];

  return (
    <div className="border-b border-slate-200 bg-navy-950 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6">
        {badges.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-navy-400" />
            <span className="text-xs font-semibold text-white">{b.label}</span>
            <span className="text-xs text-white/40">· {b.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
