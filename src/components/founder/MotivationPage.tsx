"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Clock,
  Loader2,
  Quote,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";
import { FounderShell } from "@/components/founder/FounderShell";
import { GlassCard } from "@/components/founder/GlassCard";
import { useAuth } from "@/lib/auth-context";
import { MOTIVATION_CATEGORIES } from "@/lib/motivation-quotes";
import { cn } from "@/lib/utils";
import { PRODUCT_NAME } from "@/lib/brand";

interface MotivationSettings {
  category: string;
  notifyTime: string;
  enabled: boolean;
  browserNotify: boolean;
  lastNotifiedDate: string | null;
}

interface DailyQuote {
  text: string;
  author: string;
  role: string;
  category: string;
  date: string;
}

const LOCAL_SETTINGS_KEY = "idevio-motivation-settings-v1";
const LOCAL_NOTIFIED_KEY = "idevio-motivation-notified-v1";

function loadLocalSettings(): MotivationSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as MotivationSettings;
  } catch {
    /* ignore */
  }
  return {
    category: "random",
    notifyTime: "08:00",
    enabled: true,
    browserNotify: true,
    lastNotifiedDate: null,
  };
}

function saveLocalSettings(settings: MotivationSettings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

function MotivationContent() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [settings, setSettings] = useState<MotivationSettings>(loadLocalSettings);
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [categoryInput, setCategoryInput] = useState("random");
  const [notifyTime, setNotifyTime] = useState("08:00");
  const [enabled, setEnabled] = useState(true);
  const [browserNotify, setBrowserNotify] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dbReady, setDbReady] = useState(true);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission>("default");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/motivation");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load motivation settings.");

      setSettings(data.settings);
      setQuote(data.quote);
      setCategoryInput(data.settings.category);
      setNotifyTime(data.settings.notifyTime);
      setEnabled(data.settings.enabled);
      setBrowserNotify(data.settings.browserNotify);
      setDbReady(data.dbReady !== false);
      saveLocalSettings(data.settings);
    } catch (err) {
      const local = loadLocalSettings();
      setSettings(local);
      setCategoryInput(local.category);
      setNotifyTime(local.notifyTime);
      setEnabled(local.enabled);
      setBrowserNotify(local.browserNotify);
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/motivation");
      return;
    }
    load();
  }, [user, router, load]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifyPermission(Notification.permission);
    }
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      category: categoryInput,
      notifyTime,
      enabled,
      browserNotify,
    };

    try {
      const res = await fetch("/api/motivation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.dbReady === false) {
          const local = { ...payload, lastNotifiedDate: settings.lastNotifiedDate };
          saveLocalSettings(local);
          setSettings(local);
          setMessage("Saved on this device. Run the Turso migration to sync across devices.");
          return;
        }
        throw new Error(data.error ?? "Failed to save.");
      }

      setSettings(data.settings);
      setQuote(data.quote);
      saveLocalSettings(data.settings);
      setMessage("Daily motivation updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setError("Browser notifications are not supported on this device.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifyPermission(permission);
    if (permission === "granted") {
      setMessage("Notifications enabled. We'll nudge you at your chosen time.");
      setBrowserNotify(true);
    } else {
      setError("Notification permission was blocked. Enable it in browser settings.");
    }
  };

  const sendBrowserNotification = useCallback(
    (dailyQuote: DailyQuote) => {
      if (!browserNotify || !enabled) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const today = new Date().toISOString().slice(0, 10);
      const notifiedKey = `${LOCAL_NOTIFIED_KEY}-${today}`;
      if (localStorage.getItem(notifiedKey) === "1") return;

      new Notification(`${PRODUCT_NAME} — Daily motivation`, {
        body: `"${dailyQuote.text}" — ${dailyQuote.author}`,
        icon: "/images/idevio-logo.png",
        tag: "idevio-daily-motivation",
      });

      localStorage.setItem(notifiedKey, "1");
      void fetch("/api/motivation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastNotifiedDate: today }),
      }).catch(() => undefined);
    },
    [browserNotify, enabled]
  );

  useEffect(() => {
    if (!quote || !enabled || !browserNotify) return;

    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}`;
      if (current === notifyTime) {
        sendBrowserNotification(quote);
      }
    };

    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, [quote, enabled, browserNotify, notifyTime, sendBrowserNotification]);

  const categorySuggestions = useMemo(
    () => MOTIVATION_CATEGORIES.filter((item) => item !== "random"),
    []
  );

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
      </div>
    );
  }

  return (
    <FounderShell>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <header className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            Founder mindset
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-navy-900">
            Daily Motivation
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Get a focused quote every day — discipline, leadership, sales, or random wisdom from
            legendary founders and CEOs.
          </p>
        </header>

        {!dbReady && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Run the motivation migration SQL in Turso to save settings to your account. Until then,
            settings are stored on this device only.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
          </div>
        ) : (
          <div className="space-y-6">
            <GlassCard className="overflow-hidden p-0" hover={false}>
              <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-8 py-10 text-white">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Quote className="h-6 w-6 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-300">
                      Today&apos;s quote · {quote?.category ?? settings.category}
                    </p>
                    <p className="font-display mt-4 text-2xl font-bold leading-snug">
                      &ldquo;{quote?.text}&rdquo;
                    </p>
                    <p className="mt-4 text-sm text-navy-200">
                      — {quote?.author}
                      {quote?.role ? `, ${quote.role}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-navy-700" />
                <h2 className="font-display text-lg font-bold text-navy-900">Quote category</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Type a theme like <strong>discipline</strong>, <strong>focus</strong>, or choose{" "}
                <strong>random</strong> for famous founder quotes.
              </p>

              <input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                list="motivation-categories"
                placeholder="e.g. discipline, sales, random"
                className="mt-4 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm"
              />
              <datalist id="motivation-categories">
                {MOTIVATION_CATEGORIES.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>

              <div className="mt-3 flex flex-wrap gap-2">
                {categorySuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategoryInput(item)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold capitalize transition",
                      categoryInput === item
                        ? "bg-navy-900 text-white"
                        : "bg-navy-900/8 text-navy-800 hover:bg-navy-900/12"
                    )}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCategoryInput("random")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    categoryInput === "random"
                      ? "bg-navy-900 text-white"
                      : "bg-navy-900/8 text-navy-800 hover:bg-navy-900/12"
                  )}
                >
                  random
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-navy-700" />
                <h2 className="font-display text-lg font-bold text-navy-900">
                  Daily notification
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Pick a time each day. With browser notifications on, {PRODUCT_NAME} sends your quote
                when this tab or browser is open at that time.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notification time
                  </span>
                  <div className="relative mt-1.5">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={notifyTime}
                      onChange={(e) => setNotifyTime(e.target.value)}
                      className="w-full rounded-xl border border-navy-900/10 py-2.5 pl-10 pr-3 text-sm"
                    />
                  </div>
                </label>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-navy-900">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Daily motivation enabled
                  </label>
                  <label className="flex items-center gap-3 text-sm text-navy-900">
                    <input
                      type="checkbox"
                      checked={browserNotify}
                      onChange={(e) => setBrowserNotify(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Browser notifications
                  </label>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={requestNotifications}
                  className="inline-flex items-center gap-2 rounded-xl border border-navy-900/10 px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-900/5"
                >
                  <Bell className="h-4 w-4" />
                  {notifyPermission === "granted"
                    ? "Notifications allowed"
                    : "Allow notifications"}
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save settings
                </button>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Tip: add {PRODUCT_NAME} to your phone home screen or keep a browser tab open for
                on-time nudges. System push while the app is fully closed requires extra setup later.
              </p>
            </GlassCard>

            {(message || error) && (
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm",
                  error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
                )}
              >
                {error || message}
              </div>
            )}
          </div>
        )}
      </div>
    </FounderShell>
  );
}

export function MotivationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center founder-bg">
          <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
        </div>
      }
    >
      <MotivationContent />
    </Suspense>
  );
}
