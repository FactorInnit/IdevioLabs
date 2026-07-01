import { TRUSTED_BY } from "@/lib/marketing";

export function TrustedBy() {
  return (
    <section className="bg-slate-100 py-10">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Trusted by founders & teams at
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUSTED_BY.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-tight text-slate-400 transition hover:text-navy-700"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
