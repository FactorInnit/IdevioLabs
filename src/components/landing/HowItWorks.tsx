import { ArrowRight, Bell, Map, Target } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/marketing";

const STEP_ICONS = [Map, Target, Bell];

export function HowItWorks() {
  return (
    <section className="border-t border-slate-200 bg-slate-100 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy-950">
            From idea to launch in three steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map((item, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div key={item.step} className="relative">
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-px w-8 translate-x-full bg-slate-300 md:block" />
                )}
                <div className="step-card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold text-navy-100">{item.step}</span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 shadow-lg shadow-navy-900/30">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-navy-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  {index === HOW_IT_WORKS.length - 1 && (
                    <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy-600">
                      Start free today
                      <ArrowRight className="h-3 w-3" />
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
