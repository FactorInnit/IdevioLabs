import { PLATFORM_STATS } from "@/lib/marketing";

export function StatsBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-100 md:grid-cols-4">
        {PLATFORM_STATS.map((stat) => (
          <div key={stat.label} className="px-6 py-8 text-center md:py-10">
            <p className="text-3xl font-bold tracking-tight text-navy-950 md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
