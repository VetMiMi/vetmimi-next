import { C } from "@/lib/tokens";

type SVGProps = { style?: React.CSSProperties; className?: string };

/* ── Imperfect Halo ──────────────────────────────────────── */
export function ImperfectHalo({
  color = C.indigo, size = 480, opacity = 0.88, style,
}: { color?: string; size?: number; opacity?: number } & SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400"
      style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M385 190 C394 298, 308 396, 196 390 C84 384, 4 308, 10 198 C16 88, 100 8, 208 6 C312 4, 376 82, 385 190 Z"
        fill={color} opacity={opacity}
      />
    </svg>
  );
}

/* ── Wave Divider ────────────────────────────────────────── */
export function WaveDivider({
  from, to, variant = "gentle", flip = false, style,
}: { from: string; to: string; variant?: "gentle" | "double" | "dramatic"; flip?: boolean } & SVGProps) {
  const paths: Record<string, string> = {
    gentle:   "M0 38 C360 6, 720 70, 1080 38 S 1440 6, 1440 38 L1440 80 L0 80 Z",
    double:   "M0 28 C240 0, 480 56, 720 28 C960 0, 1200 56, 1440 28 L1440 80 L0 80 Z",
    dramatic: "M0 70 Q720 0 1440 70 L1440 80 L0 80 Z",
  };
  return (
    <div style={{ background: from, lineHeight: 0, ...style }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
        style={{ display: "block", width: "100%", transform: flip ? "scaleY(-1)" : undefined }}
        aria-hidden>
        <path d={paths[variant]} fill={to} />
      </svg>
    </div>
  );
}

/* ── Aqua Ribbon ─────────────────────────────────────────── */
export function AquaRibbon({ style }: SVGProps) {
  return (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
      style={{ display: "block", width: "100%", pointerEvents: "none", ...style }} aria-hidden>
      <path
        d="M-60 160 C240 60, 540 200, 840 120 C1080 60, 1260 170, 1500 80"
        stroke={C.aqua} strokeWidth="38" fill="none" opacity="0.28"
        strokeLinecap="round"
      />
      <path
        d="M-40 165 C250 70, 560 195, 860 115 C1100 55, 1280 165, 1520 75"
        stroke={C.aqua} strokeWidth="14" fill="none" opacity="0.18"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Coral Wave Field (hero right side) ──────────────────── */
export function CoralWaveField({ style }: SVGProps) {
  return (
    <svg viewBox="0 0 700 700" style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M460 0 C540 80, 700 60, 700 200 C700 380, 600 460, 560 560 C520 660, 600 700, 700 700 L700 0 Z"
        fill={C.red} opacity="0.13"
      />
      <path
        d="M520 0 C600 100, 700 120, 700 260 C700 420, 640 500, 660 620 C680 700, 700 700, 700 700 L700 0 Z"
        fill={C.coral} opacity="0.09"
      />
    </svg>
  );
}

/* ── Gold Mark ───────────────────────────────────────────── */
export function GoldMark({ size = 48, style }: { size?: number } & SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48"
      style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M8 24 C12 16, 20 10, 28 14 C36 18, 40 30, 34 36 C28 42, 16 38, 12 32 C10 28, 14 20, 20 22"
        stroke={C.ochre} strokeWidth="2.5" fill="none" opacity="0.75"
        strokeLinecap="round"
      />
      <circle cx="28" cy="14" r="2.5" fill={C.ochre} opacity="0.6" />
    </svg>
  );
}

/* ── Petal Outline ───────────────────────────────────────── */
export function PetalOutline({ color = C.coral, size = 80, style }: { color?: string; size?: number } & SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80"
      style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M40 8 C58 8, 74 22, 72 40 C70 58, 54 72, 40 72 C26 72, 8 58, 8 40 C8 22, 22 8, 40 8 Z"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.55"
        transform="rotate(-20 40 40)"
      />
      <path
        d="M40 14 C54 14, 66 26, 64 40 C62 54, 50 66, 40 66 C30 66, 18 54, 16 40 C14 26, 26 14, 40 14 Z"
        fill="none" stroke={color} strokeWidth="1" opacity="0.3"
        transform="rotate(15 40 40)"
      />
    </svg>
  );
}

/* ── Open Mint Partial Circle ────────────────────────────── */
export function MintOpenCircle({ size = 340, style }: { size?: number } & SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 340 340"
      style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M170 20 A150 150 0 1 1 50 255"
        fill="none" stroke={C.aqua} strokeWidth="2.5" opacity="0.55"
        strokeLinecap="round"
      />
      <path
        d="M170 30 A140 140 0 0 1 295 230"
        fill="none" stroke={C.aqua} strokeWidth="1" opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Almond / Eye ────────────────────────────────────────── */
export function AlmondEye({ color = C.rose, size = 60, style }: { color?: string; size?: number } & SVGProps) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 60 30"
      style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M4 15 C12 4, 48 4, 56 15 C48 26, 12 26, 4 15 Z"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.5"
      />
      <circle cx="30" cy="15" r="5" fill={color} opacity="0.35" />
    </svg>
  );
}

/* ── Service Symbols ─────────────────────────────────────── */
export function NestedOval({ color = C.rose, size = 80, style }: { color?: string; size?: number } & SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80"
      style={{ display: "block", ...style }} aria-hidden>
      <ellipse cx="40" cy="40" rx="36" ry="26" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" transform="rotate(-15 40 40)" />
      <ellipse cx="40" cy="40" rx="22" ry="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.45" transform="rotate(-15 40 40)" />
      <ellipse cx="40" cy="40" rx="9" ry="5" fill={color} opacity="0.25" transform="rotate(-15 40 40)" />
    </svg>
  );
}

export function OverlappingCircles({ color = C.aqua, size = 80, style }: { color?: string; size?: number } & SVGProps) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 90 70"
      style={{ display: "block", ...style }} aria-hidden>
      <circle cx="24" cy="38" r="22" fill={color} opacity="0.2" />
      <circle cx="45" cy="28" r="22" fill={color} opacity="0.2" />
      <circle cx="66" cy="38" r="22" fill={color} opacity="0.2" />
      <circle cx="24" cy="38" r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <circle cx="45" cy="28" r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <circle cx="66" cy="38" r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function FlowingRibbon({ color = C.ochre, size = 80, style }: { color?: string; size?: number } & SVGProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60"
      style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M10 48 C20 10, 40 50, 50 20 C60 -10, 80 40, 90 12"
        stroke={color} strokeWidth="2.5" fill="none" opacity="0.6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="48" r="4" fill={color} opacity="0.45" />
      <circle cx="50" cy="20" r="4" fill={color} opacity="0.45" />
      <circle cx="90" cy="12" r="4" fill={color} opacity="0.45" />
    </svg>
  );
}

/* ── Lavender Wave (section accent) ─────────────────────── */
export function LavenderWaveAccent({ style }: SVGProps) {
  return (
    <svg viewBox="0 0 600 200" style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M0 120 C100 40, 200 180, 300 100 C400 20, 500 140, 600 80"
        stroke={C.violet} strokeWidth="60" fill="none" opacity="0.12"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Hand-drawn Connecting Thread ────────────────────────── */
export function ConnectingThread({
  color = C.ochre, points, style,
}: { color?: string; points: [number, number][] } & SVGProps) {
  if (points.length < 2) return null;
  const d = points
    .map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `C${x - 30} ${points[i - 1][1] + 20}, ${x - 30} ${y - 20}, ${x} ${y}`))
    .join(" ");
  const maxX = Math.max(...points.map(([x]) => x)) + 20;
  const maxY = Math.max(...points.map(([, y]) => y)) + 20;
  return (
    <svg width={maxX} height={maxY} viewBox={`0 0 ${maxX} ${maxY}`}
      style={{ display: "block", ...style }} aria-hidden>
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" strokeDasharray="4 3" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={color} opacity="0.5" />
      ))}
    </svg>
  );
}

/* ── Dark feature wave (top of indigo section) ───────────── */
export function DarkWaveTop({ from = C.paper, to = C.indigo, style }: { from?: string; to?: string } & SVGProps) {
  return (
    <div style={{ background: from, lineHeight: 0, ...style }}>
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none"
        style={{ display: "block", width: "100%" }} aria-hidden>
        <path d="M0 60 C300 0, 700 90, 1100 30 C1250 10, 1380 60, 1440 50 L1440 90 L0 90 Z" fill={to} />
      </svg>
    </div>
  );
}
