"use client";

import { useState } from "react";
import { GlassCard } from "../GlassCard";

export function RevenueSimulator() {
  const [users, setUsers] = useState(5000);
  const [conversion, setConversion] = useState(3.2);
  const [retention, setRetention] = useState(85);
  const [price, setPrice] = useState(29);
  const [cac, setCac] = useState(45);

  const paying = Math.round(users * (conversion / 100));
  const mrr = paying * price;
  const arr = mrr * 12;
  const ltv = Math.round((price * 12 * retention) / 100);
  const burn = Math.round(paying * cac * 0.3);
  const runway = Math.round(250_000 / Math.max(burn, 1));
  const valuation = Math.round(arr * 8);

  const sliders = [
    { label: "Monthly Users", value: users, min: 500, max: 50000, step: 500, set: setUsers },
    { label: "Conversion %", value: conversion, min: 0.5, max: 10, step: 0.1, set: setConversion },
    { label: "Retention %", value: retention, min: 50, max: 98, step: 1, set: setRetention },
    { label: "Pricing ($)", value: price, min: 9, max: 199, step: 1, set: setPrice },
    { label: "CAC ($)", value: cac, min: 10, max: 200, step: 5, set: setCac },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard className="p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Revenue Simulator
        </p>
        <h2 className="font-display text-xl font-bold text-navy-900">Live financial model</h2>
        <div className="mt-6 space-y-5">
          {sliders.map((s) => (
            <div key={s.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-navy-800">{s.label}</span>
                <span className="tabular-nums text-slate-500">{s.value}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-navy-900/10 accent-navy-800"
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "MRR", value: `$${mrr.toLocaleString()}`, highlight: true },
          { label: "ARR", value: `$${arr.toLocaleString()}` },
          { label: "LTV", value: `$${ltv.toLocaleString()}` },
          { label: "Paying Users", value: paying.toLocaleString() },
          { label: "Monthly Burn", value: `$${burn.toLocaleString()}` },
          { label: "Runway", value: `${runway} mo` },
          { label: "Valuation Est.", value: `$${(valuation / 1_000_000).toFixed(1)}M`, highlight: true },
          { label: "LTV:CAC", value: `${(ltv / cac).toFixed(1)}x` },
        ].map((m) => (
          <GlassCard
            key={m.label}
            className={`p-4 ${m.highlight ? "founder-glow-pulse border-navy-400/20" : ""}`}
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {m.label}
            </p>
            <p className="font-display text-2xl font-bold text-navy-900">{m.value}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
