import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { PromptHero } from "@/components/PromptHero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <PromptHero />
      <AppFooter />
    </div>
  );
}
