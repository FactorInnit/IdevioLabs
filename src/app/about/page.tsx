import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Logo } from "@/components/Logo";
import { PRODUCT_NAME, COMPANY_NAME } from "@/lib/brand";
import Link from "next/link";
import { ArrowRight, Bot, DollarSign, Map, Shield, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen founder-bg">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          About {COMPANY_NAME}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
          The operating system for startups
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          {PRODUCT_NAME} is built by {COMPANY_NAME} to give every founder the command center
          that used to only exist inside billion-dollar companies — roadmap, finances, validation,
          competitors, habits, and an AI coach that actually executes changes in your workspace.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: Map,
              title: "Company Digital Twin",
              text: "A live model of your startup that updates when you change pricing, hiring, or strategy.",
            },
            {
              icon: DollarSign,
              title: "Budget-aware from day one",
              text: "Every tool recommendation fits your budget. See allocation, runway, and recommended stack.",
            },
            {
              icon: Bot,
              title: "AI Founder Coach",
              text: "Not a chatbot in a corner — integrated across your workspace, always on the right.",
            },
            {
              icon: Shield,
              title: "Built for execution",
              text: "Validator scores, daily habits, phased roadmaps — designed to help you ship, not just plan.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-display font-bold text-navy-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-navy-950 px-8 py-10 text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="flex items-center justify-center gap-2 font-display text-xl font-bold text-white">
            <Sparkles className="h-5 w-5" />
            Ready to build inside {PRODUCT_NAME}?
          </p>
          <Link
            href="/#get-started"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-navy-900"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
