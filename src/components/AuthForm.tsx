"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { PRODUCT_NAME } from "@/lib/brand";

export function AuthForm({
  mode,
  next = "/dashboard",
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const router = useRouter();
  const { user, login, signup, refresh } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError === "google_not_configured") {
      setError("Google sign-in is not configured yet.");
    } else if (urlError === "google_token_failed") {
      setError(
        "Google redirect URL mismatch. In Google Cloud Console, add: https://ideviolabs.com/api/auth/google/callback"
      );
    } else if (urlError === "database_not_configured") {
      setError(
        "Database not set up. Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel, then redeploy."
      );
    } else if (urlError === "google_signin_failed") {
      setError("Google sign-in failed. Please try again.");
    } else if (urlError === "invalid_state") {
      setError("Sign-in session expired. Please try again.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result =
      mode === "login"
        ? await login(email, password)
        : await signup(name, email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    await refresh();
    router.replace(next);
    router.refresh();
  };

  const googleHref = `/api/auth/google?next=${encodeURIComponent(next)}`;

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <Logo size="lg" />
        <span className="font-display text-xl font-bold text-navy-950">
          {PRODUCT_NAME}
        </span>
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-navy-900/5">
        <h1 className="font-display text-2xl font-bold text-navy-950">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login"
            ? "Sign in to access your startup roadmaps."
            : "Sign up free — your first startup roadmap is on us."}
        </p>

        <a
          href={googleHref}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:border-navy-300 hover:bg-slate-50"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Field
              icon={User}
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Ada Lovelace"
              type="text"
              required
            />
          )}
          <Field
            icon={Mail}
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
            type="email"
            required
          />
          <Field
            icon={Lock}
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            New to {PRODUCT_NAME}?{" "}
            <Link href="/signup" className="font-semibold text-navy-700 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-navy-700 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type,
  required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-navy-900">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-navy-400 focus:bg-white"
        />
      </div>
    </div>
  );
}
