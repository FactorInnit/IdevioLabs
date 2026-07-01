import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/marketing";

export function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
            Founder stories
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy-950">
            Loved by builders worldwide
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-navy-800 text-navy-800" />
              ))}
            </div>
            <span className="text-sm font-semibold text-navy-900">4.9 out of 5</span>
            <span className="text-sm text-slate-400">· 2,100+ reviews</span>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="card-3d-lift rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-navy-200 hover:bg-white hover:shadow-lg hover:shadow-navy-900/5"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-navy-700 text-navy-700" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-950">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
