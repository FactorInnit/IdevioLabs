"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { AuthForm } from "@/components/AuthForm";

function SignupContent() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  return <AuthForm mode="signup" next={next} />;
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Suspense
          fallback={<Loader2 className="h-8 w-8 animate-spin text-navy-700" />}
        >
          <SignupContent />
        </Suspense>
      </main>
      <AppFooter />
    </div>
  );
}
