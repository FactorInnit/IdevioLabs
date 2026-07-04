"use client";

/** Deterministic star positions — stable across SSR and client. */
const STARS = Array.from({ length: 90 }, (_, i) => {
  const n = i + 1;
  return {
    id: i,
    left: ((n * 47 + 13) % 100) + (n % 7) * 0.3,
    top: ((n * 61 + 29) % 100) + (n % 5) * 0.4,
    size: n % 11 === 0 ? 3 : n % 4 === 0 ? 2.25 : 1.5,
    opacity: 0.45 + (n % 6) * 0.08,
    twinkle: n % 4 === 0,
    delay: (n % 8) * 0.45,
    duration: 2.5 + (n % 4) * 0.8,
  };
});

const SHOOTING_STARS = [
  { top: "18%", left: "72%", delay: "0s" },
  { top: "42%", left: "88%", delay: "4.5s" },
  { top: "8%", left: "35%", delay: "9s" },
];

export function StarField({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      {STARS.map((star) => (
        <span
          key={star.id}
          className={star.twinkle ? "command-center-star command-center-star-twinkle" : "command-center-star"}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {SHOOTING_STARS.map((s, i) => (
        <span
          key={i}
          className="command-center-shooting-star"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}
