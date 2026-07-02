import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { PromptHero } from "@/components/PromptHero";

export default function HomePage() {
  return (
    <div className="min-h-screen founder-bg">
      <AppHeader />
      <PromptHero />
      <AppFooter />
    </div>
  );
}
