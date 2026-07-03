"use client";

interface RadarChartProps {
  labels: string[];
  values: number[];
  size?: number;
}

export function RadarChart({ labels, values, size = 280 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = labels.length;

  const point = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const rings = [25, 50, 75, 100];
  const dataPoints = values.map((v, i) => point(i, v));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} className="mx-auto">
      {rings.map((ring) => {
        const pts = labels
          .map((_, i) => {
            const p = point(i, ring);
            return `${p.x},${p.y}`;
          })
          .join(" ");
        return (
          <polygon
            key={ring}
            points={pts}
            fill="none"
            stroke="rgba(8,26,58,0.08)"
            strokeWidth={1}
          />
        );
      })}
      {labels.map((label, i) => {
        const outer = point(i, 100);
        const inner = point(i, 0);
        const labelPt = point(i, 115);
        return (
          <g key={label}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(8,26,58,0.06)"
              strokeWidth={1}
            />
            <text
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-[9px] font-semibold"
            >
              {label.length > 12 ? `${label.slice(0, 11)}…` : label}
            </text>
          </g>
        );
      })}
      <polygon
        points={polygon}
        fill="rgba(8,26,58,0.15)"
        stroke="#081a3a"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#081a3a" />
      ))}
    </svg>
  );
}
