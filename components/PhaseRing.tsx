"use client";
import { motion } from "framer-motion";
import { COLORS, PHASES } from "@/lib/theme";

function arcPath(
  idx: number,
  total: number,
  oR: number,
  iR: number,
  cx: number,
  cy: number,
  gap = 5
): string {
  const seg = 360 / total;
  const s0 = -90 + idx * seg + gap / 2;
  const s1 = -90 + (idx + 1) * seg - gap / 2;
  const toR = (d: number) => (d * Math.PI) / 180;
  const a0 = toR(s0);
  const a1 = toR(s1);
  const lg = s1 - s0 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  const [x0, y0] = [cx + oR * Math.cos(a0), cy + oR * Math.sin(a0)];
  const [x1, y1] = [cx + oR * Math.cos(a1), cy + oR * Math.sin(a1)];
  const [x2, y2] = [cx + iR * Math.cos(a1), cy + iR * Math.sin(a1)];
  const [x3, y3] = [cx + iR * Math.cos(a0), cy + iR * Math.sin(a0)];
  return `M${f(x0)},${f(y0)} A${oR},${oR} 0 ${lg},1 ${f(x1)},${f(y1)} L${f(x2)},${f(y2)} A${iR},${iR} 0 ${lg},0 ${f(x3)},${f(y3)}Z`;
}

export default function PhaseRing({
  size = 220,
  logoColor = COLORS.plum,
  animated = true,
  highlightPhase,
}: {
  size?: number;
  logoColor?: string;
  animated?: boolean;
  /** Index (0-4) of a phase to visually emphasize; others dim slightly. */
  highlightPhase?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const oR = size * 0.43;
  const iR = size * 0.27;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="herLoop phase ring">
      {PHASES.map((p, i) => {
        const dim = highlightPhase !== undefined && highlightPhase !== i;
        return animated ? (
          <motion.path
            key={p.name}
            d={arcPath(i, 5, oR, iR, cx, cy)}
            fill={p.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: dim ? 0.35 : 1 }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: "easeOut" }}
          />
        ) : (
          <path key={p.name} d={arcPath(i, 5, oR, iR, cx, cy)} fill={p.color} opacity={dim ? 0.35 : 1} />
        );
      })}
      <text
        x={cx}
        y={cy - size * 0.03}
        textAnchor="middle"
        fontSize={size * 0.1}
        fill={logoColor}
        fontFamily="Fraunces, serif"
        fontStyle="italic"
        fontWeight={400}
      >
        her
      </text>
      <text
        x={cx}
        y={cy + size * 0.115}
        textAnchor="middle"
        fontSize={size * 0.125}
        fill={logoColor}
        fontFamily="Fraunces, serif"
        fontWeight={700}
      >
        Loop
      </text>
    </svg>
  );
}
