import { useId } from "react";
import { useCurrentFrame } from "remotion";
import { color, font } from "../theme";

export function Icon({ size, draw = 1 }: { size: number; draw?: number }) {
  return (
    <svg height={size} viewBox="0 0 64 64" width={size}>
      <rect fill={color.indigo} height={64} rx={14} width={64} />
      <text
        fill={color.canvas}
        fontFamily={font.display}
        fontSize={30}
        fontWeight={500}
        textAnchor="middle"
        x={31}
        y={42}
      >
        Vm
      </text>
      <path
        d="M17 49c9 2.4 21 2.6 31-.6"
        fill="none"
        pathLength={1}
        stroke={color.coral}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        strokeLinecap="round"
        strokeWidth={2.4}
      />
    </svg>
  );
}

export function Wordmark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
      <span style={{ fontFamily: font.display, fontSize: size, letterSpacing: "-0.01em", color: color.ink }}>
        VetMiMi
      </span>
      <span
        style={{
          marginTop: size * 0.16,
          fontFamily: font.sans,
          fontSize: size * 0.2,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: color.label,
        }}
      >
        DAW MI · ART THERAPIST
      </span>
    </div>
  );
}

type Stroke = { draw: number; tone?: string; weight?: number };

function strokeProps({ draw, tone = color.coral, weight = 5 }: Stroke) {
  return {
    fill: "none",
    pathLength: 1,
    stroke: tone,
    strokeDasharray: 1,
    strokeDashoffset: 1 - draw,
    strokeLinecap: "round" as const,
    strokeWidth: weight,
    vectorEffect: "non-scaling-stroke" as const,
  };
}

// A hand-drawn underline, stretched to whatever box it sits in. It is revealed
// with a clip rather than a dash, because dashes break on a stretched stroke.
export function Underline({ draw, tone = color.coral, weight = 5 }: Stroke) {
  const id = `underline-${useId().replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      preserveAspectRatio="none"
      style={{ position: "absolute", left: "-2%", bottom: "-0.28em", width: "104%", height: "0.3em", overflow: "visible" }}
      viewBox="0 0 200 16"
    >
      <clipPath id={id}>
        <rect height={40} width={draw * 210} x={-5} y={-12} />
      </clipPath>
      <path
        clipPath={`url(#${id})`}
        d="M3 11 C 55 5, 130 3, 197 8"
        fill="none"
        stroke={tone}
        strokeLinecap="round"
        strokeWidth={weight}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// A loose, slightly open circle drawn around something.
export function Loop(props: Stroke) {
  return (
    <svg
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      viewBox="0 0 200 100"
    >
      <path
        d="M34 16 C 84 0, 172 4, 192 40 C 206 76, 130 99, 80 95 C 24 91, 0 62, 12 36 C 20 20, 50 9, 98 7"
        {...strokeProps(props)}
      />
    </svg>
  );
}

type Wash = { x: number; y: number; size: number; tone: string; opacity?: number };

// Soft translucent shapes from the design spec, drifting slowly.
export function Washes({ items }: { items: Wash[] }) {
  const frame = useCurrentFrame();
  return (
    <>
      {items.map((item, index) => {
        const drift = Math.sin(frame / 70 + index * 1.7) * 14;
        return (
          <span
            key={index}
            style={{
              position: "absolute",
              left: item.x - item.size / 2,
              top: item.y - item.size / 2,
              width: item.size,
              height: item.size * 0.92,
              borderRadius: "48% 52% 46% 54%",
              background: item.tone,
              opacity: item.opacity ?? 0.22,
              transform: `translate(${drift}px, ${-drift * 0.6}px) rotate(${index * 40 + frame / 12}deg)`,
            }}
          />
        );
      })}
    </>
  );
}
