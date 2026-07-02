"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PlanId } from "./plans";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: PlanId;
  projectCount?: number;
  maxStartups?: number;
  canCreateMore?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  planId: PlanId;
  checkoutPlan: (id: PlanId) => Promise<{ error?: string; url?: string }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const planId: PlanId = user?.plan ?? "free";

  const checkoutPlan = useCallback(
    async (id: PlanId) => {
      if (id === "free") {
        return { error: "You are already on the free plan." };
      }

      if (!user) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return { error: "Sign in required." };
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: id }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { error: data.error ?? "Checkout failed." };
      }

      if (data.url) {
        window.location.href = data.url;
      }

      return { url: data.url };
    },
    [user]
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Failed to sign in." };
    setUser(data.user);
    return {};
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? "Failed to create account." };
      setUser(data.user);
      return {};
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, planId, checkoutPlan, login, signup, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
