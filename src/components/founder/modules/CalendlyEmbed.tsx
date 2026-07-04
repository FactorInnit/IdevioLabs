"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

export function CalendlyEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent || !url) return;

    parent.innerHTML = "";

    const init = () => {
      if (window.Calendly && parent) {
        window.Calendly.initInlineWidget({ url, parentElement: parent });
      }
    };

    if (window.Calendly) {
      init();
      return;
    }

    const existing = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
    if (existing) {
      existing.addEventListener("load", init);
      return () => existing.removeEventListener("load", init);
    }

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="min-h-[680px] w-full overflow-hidden rounded-xl border border-navy-900/8 bg-white"
    />
  );
}
