import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, Underline, Washes, Wordmark } from "../components/Brand";
import { progress, rise } from "../motion";
import { color, font } from "../theme";

export function Title() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: color.canvas, alignItems: "center", justifyContent: "center" }}>
      <Washes
        items={[
          { x: 300, y: 250, size: 460, tone: color.aqua },
          { x: 470, y: 380, size: 260, tone: color.butter, opacity: 0.3 },
          { x: 1650, y: 840, size: 520, tone: color.rose, opacity: 0.14 },
          { x: 1500, y: 960, size: 300, tone: color.ochre, opacity: 0.2 },
        ]}
      />
      <div style={{ transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.4) }}>
        <Icon draw={progress(frame, 16, 30)} size={190} />
      </div>
      <div style={{ marginTop: 48, ...rise(frame, 26) }}>
        <Wordmark size={150} />
      </div>
      <p style={{ margin: "56px 0 0", fontFamily: font.sans, fontSize: 46, color: color.muted, ...rise(frame, 44) }}>
        Art therapy with Daw Mi,{" "}
        <span style={{ position: "relative", color: color.ink }}>
          booked online.
          <Underline draw={progress(frame, 66, 34)} weight={5} />
        </span>
      </p>
      <p
        style={{
          position: "absolute",
          bottom: 76,
          margin: 0,
          fontFamily: font.sans,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: color.muted,
          ...rise(frame, 72, 12),
        }}
      >
        SYDNEY · ENGLISH AND မြန်မာ
      </p>
    </AbsoluteFill>
  );
}
