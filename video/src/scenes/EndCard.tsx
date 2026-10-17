import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, Underline, Washes, Wordmark } from "../components/Brand";
import { progress, rise } from "../motion";
import { color, font } from "../theme";

export function EndCard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: color.canvas, alignItems: "center", justifyContent: "center" }}>
      <Washes
        items={[
          { x: 1640, y: 230, size: 440, tone: color.aqua },
          { x: 1480, y: 330, size: 240, tone: color.butter, opacity: 0.3 },
          { x: 260, y: 860, size: 480, tone: color.rose, opacity: 0.14 },
        ]}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.4) }}>
          <Icon size={150} />
        </div>
        <div style={rise(frame, 12)}>
          <Wordmark size={110} />
        </div>
      </div>
      <p
        style={{
          position: "relative",
          margin: "90px 0 0",
          fontFamily: font.display,
          fontSize: 72,
          letterSpacing: "-0.015em",
          color: color.ink,
          ...rise(frame, 30),
        }}
      >
        vetmimi.duckdns.org
        <Underline draw={progress(frame, 50, 30)} weight={5} />
      </p>
      <p style={{ margin: "40px 0 0", fontFamily: font.sans, fontSize: 34, fontWeight: 600, color: color.muted, ...rise(frame, 42) }}>
        github.com/VetMiMi
      </p>
      <p
        style={{
          position: "absolute",
          bottom: 64,
          margin: 0,
          fontFamily: font.sans,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "0.16em",
          color: color.muted,
          ...rise(frame, 60, 10),
        }}
      >
        SCREENS SHOW MADE-UP DEMO DATA
      </p>
    </AbsoluteFill>
  );
}
