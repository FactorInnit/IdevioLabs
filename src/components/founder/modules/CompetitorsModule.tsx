"use client";

import { GlassCard } from "../GlassCard";
import { Swords, Target } from "lucide-react";

const COMPETITORS = [
  {
    name: "HealthTrack Pro",
    funding: "$12M Series A",
    employees: "45",
    pricing: "$49/mo",
    traffic: "120K/mo",
    moat: "Low",
    weakness: "Poor mobile UX",
  },
  {
    name: "CalorieAI",
    funding: "$3M Seed",
    employees: "12",
    pricing: "Freemium",
    traffic: "85K/mo",
    moat: "Medium",
    weakness: "Limited B2B",
  },
  {
    name: "NutriFlow",
    funding: "Bootstrapped",
    employees: "8",
    pricing: "$19/mo",
    traffic: "32K/mo",
    moat: "Low",
    weakness: "No AI features",
  },
];

export function CompetitorsModule() {
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/8">
            <Swords className="h-5 w-5 text-navy-700" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">
              AI Competitor Intelligence
            </h2>
            <p className="text-sm text-slate-500">Auto-discovered landscape</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {COMPETITORS.map((c) => (
          <GlassCard key={c.name} className="p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 text-sm font-bold text-white">
              {c.name.charAt(0)}
            </div>
            <h3 className="font-display font-bold text-navy-900">{c.name}</h3>
            <dl className="mt-4 space-y-2 text-xs">
              {[
                ["Funding", c.funding],
                ["Team", c.employees],
                ["Pricing", c.pricing],
                ["Traffic", c.traffic],
                ["Moat", c.moat],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="font-medium text-navy-800">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-lg bg-red-50 px-2 py-1 text-[11px] text-red-700">
              Weakness: {c.weakness}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="flex items-center gap-4 p-6">
        <Target className="h-8 w-8 text-navy-600" />
        <div>
          <p className="font-display font-semibold text-navy-900">How can we beat them?</p>
          <p className="text-sm text-slate-500">
            Focus on AI-native UX, B2B wellness partnerships, and 40% lower CAC via content-led growth.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
