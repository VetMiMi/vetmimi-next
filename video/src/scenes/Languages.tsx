import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BrowserFrame, Screenshot } from "../components/Devices";
import { Kicker } from "../components/Kicker";
import { progress, rise } from "../motion";
import { color, font } from "../theme";

const flipAt = 96;
const browserWidth = 1100;

function Switch({ burmese }: { burmese: number }) {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        padding: 6,
        borderRadius: 40,
        border: `1px solid ${color.line}`,
        background: color.raised,
        fontFamily: font.sans,
        fontSize: 26,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 6,
          bottom: 6,
          left: 6 + burmese * 150,
          width: 150,
          borderRadius: 34,
          background: color.indigo,
        }}
      />
      {["English", "မြန်မာ"].map((label, index) => {
        const active = index === 0 ? 1 - burmese : burmese;
        return (
          <span
            key={label}
            style={{
              position: "relative",
              width: 150,
              padding: "12px 0",
              textAlign: "center",
              color: active > 0.5 ? color.canvas : color.ink,
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

export function Languages() {
  const frame = useCurrentFrame();
  const burmese = progress(frame, flipAt, 16);
  return (
    <AbsoluteFill
      style={{ flexDirection: "row", alignItems: "center", gap: 80, paddingLeft: 120, background: color.canvas }}
    >
      <div style={{ width: 520 }}>
        <Kicker style={rise(frame, 4, 14)}>TWO LANGUAGES</Kicker>
        <p
          style={{
            margin: "24px 0 0",
            fontFamily: font.display,
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: color.ink,
            ...rise(frame, 10),
          }}
        >
          Every page in English and Burmese.
        </p>
        <p style={{ margin: "28px 0 40px", fontFamily: font.sans, fontSize: 30, lineHeight: 1.45, color: color.muted, ...rise(frame, 18) }}>
          One switch in the header. Burmese gets its own font and taller lines.
        </p>
        <div style={rise(frame, 26)}>
          <Switch burmese={burmese} />
        </div>
      </div>
      <div style={rise(frame, 6, 40)}>
        <BrowserFrame address={frame < flipAt + 8 ? "vetmimi.duckdns.org" : "vetmimi.duckdns.org/my"} width={browserWidth}>
          <Screenshot file="home-en.webp" sourceWidth={1440} viewWidth={browserWidth} />
          <Screenshot file="home-my.webp" opacity={burmese} sourceWidth={1440} viewWidth={browserWidth} />
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
}
