"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "idevio_cookie_notice_dismissed";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-navy-900/10 sm:left-auto sm:right-6">
      <p className="text-sm leading-relaxed text-slate-600">
        We use essential cookies to keep you signed in and run {` `}
        <strong className="font-semibold text-navy-900">Idevio</strong>. See our{" "}
        <Link href="/privacy" className="font-semibold text-navy-700 hover:underline">
          Privacy Policy
        </Link>{" "}
        for details.
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            window.localStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
        className="mt-3 rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-800"
      >
        Got it
      </button>
    </div>
  );
}
