import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Kicker } from "../components/Kicker";
import { progress, rise } from "../motion";
import { color, font } from "../theme";

const pressAt = 70;
const reachAt = 100;
const answerAt = 128;
const captionAt = 170;

const cardWidth = 580;
const cards = [
  { name: "Hla Hla", left: 300, wins: true },
  { name: "Ben W.", left: 1920 - 300 - cardWidth, wins: false },
];
const cardTop = 290;
const cardHeight = 330;
const db = { x: 960, y: 760 };

function Card({ name, wins }: { name: string; wins: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pressed = frame >= pressAt - 3 && frame < pressAt + 4;
  const sent = frame >= pressAt;
  const answer = spring({ frame: frame - answerAt, fps, config: { damping: 15 } });
  return (
    <div
      style={{
        position: "relative",
        width: cardWidth,
        height: cardHeight,
        padding: "34px 40px",
        boxSizing: "border-box",
        borderRadius: 24,
        border: `1px solid ${color.line}`,
        background: color.raised,
        boxShadow: "0 40px 70px -50px rgba(40,37,45,0.45)",
        fontFamily: font.sans,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            background: wins ? color.aqua : color.butter,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: color.ink,
          }}
        >
          {name[0]}
        </span>
        <span style={{ fontSize: 28, fontWeight: 600, color: color.ink }}>{name}</span>
      </div>
      <p style={{ margin: "26px 0 0", fontSize: 26, color: color.muted }}>Individual Art Therapy · 60 min</p>
      <p style={{ margin: "8px 0 0", fontFamily: font.display, fontSize: 36, color: color.ink }}>
        Mon 19 Oct · 2:00 pm
      </p>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 34,
          height: 68,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 25,
          fontWeight: 600,
          background: color.action,
          color: color.canvas,
          transform: `scale(${pressed ? 0.96 : 1})`,
          opacity: (sent ? 0.7 : 1) * (1 - answer),
        }}
      >
        {sent ? "Sending…" : "Submit Appointment Request"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 34,
          height: 68,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontSize: 27,
          fontWeight: 700,
          background: wins ? "#eef0e2" : "#fbe9e6",
          color: wins ? color.olive : color.action,
          opacity: answer,
          transform: `translateY(${(1 - answer) * 14}px)`,
        }}
      >
        {wins ? "✓  Booked" : "That time was just taken"}
      </div>
    </div>
  );
}

function Wires() {
  const frame = useCurrentFrame();
  const go = progress(frame, pressAt, reachAt - pressAt);
  const back = progress(frame, reachAt + 6, answerAt - reachAt - 6);
  const draw = progress(frame, 20, 30);
  return (
    <svg height={1080} style={{ position: "absolute", inset: 0 }} width={1920}>
      {cards.map((card) => {
        const start = { x: card.left + cardWidth / 2, y: cardTop + cardHeight };
        const end = { x: db.x + (card.wins ? -60 : 60), y: db.y - 44 };
        const path = `M ${start.x} ${start.y} C ${start.x} ${start.y + 90}, ${end.x} ${end.y - 90}, ${end.x} ${end.y}`;
        const at = (t: number) => {
          const u = 1 - t;
          return {
            x: u ** 3 * start.x + 3 * u * u * t * start.x + 3 * u * t * t * end.x + t ** 3 * end.x,
            y: u ** 3 * start.y + 3 * u * u * t * (start.y + 90) + 3 * u * t * t * (end.y - 90) + t ** 3 * end.y,
          };
        };
        const out = at(go);
        const home = at(1 - back);
        return (
          <g key={card.name}>
            <path
              d={path}
              fill="none"
              pathLength={1}
              stroke="#d6cbc3"
              strokeDasharray="0.012 0.012"
              strokeDashoffset={0}
              strokeWidth={3}
              opacity={draw}
            />
            {frame >= pressAt && frame < reachAt + 2 && <circle cx={out.x} cy={out.y} fill={color.indigo} r={9} />}
            {frame >= reachAt + 6 && back < 1 && (
              <circle cx={home.x} cy={home.y} fill={card.wins ? color.olive : color.coral} r={9} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Database() {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [reachAt - 2, reachAt + 6, reachAt + 26], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: db.x - 190,
        top: db.y - 44,
        width: 380,
        height: 88,
        borderRadius: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: color.indigo,
        color: color.canvas,
        fontFamily: font.display,
        fontSize: 38,
        boxShadow: `0 0 0 ${glow * 14}px rgba(145,192,211,${0.45 * glow})`,
        ...rise(frame, 24, 20),
      }}
    >
      <svg height={40} viewBox="0 0 24 28" width={34}>
        <ellipse cx={12} cy={5} fill="none" rx={10} ry={4} stroke={color.aqua} strokeWidth={2} />
        <path d="M2 5v18c0 2.2 4.5 4 10 4s10-1.8 10-4V5M2 14c0 2.2 4.5 4 10 4s10-1.8 10-4" fill="none" stroke={color.aqua} strokeWidth={2} />
      </svg>
      PostgreSQL
    </div>
  );
}

export function Race() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: color.canvas }}>
      <div style={{ position: "absolute", top: 84, left: 0, right: 0, textAlign: "center" }}>
        <Kicker style={rise(frame, 2, 14)}>NO DOUBLE BOOKING</Kicker>
        <p
          style={{
            margin: "20px 0 0",
            fontFamily: font.display,
            fontSize: 72,
            letterSpacing: "-0.02em",
            color: color.ink,
            ...rise(frame, 8),
          }}
        >
          Two people, one time. Only one gets it.
        </p>
      </div>
      <Wires />
      {cards.map((card, index) => (
        <div key={card.name} style={{ position: "absolute", left: card.left, top: cardTop, ...rise(frame, 12 + index * 6, 40) }}>
          <Card name={card.name} wins={card.wins} />
        </div>
      ))}
      <Database />
      <p
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 900,
          margin: 0,
          textAlign: "center",
          fontFamily: font.sans,
          fontSize: 34,
          color: color.muted,
          ...rise(frame, captionAt, 16),
        }}
      >
        <strong style={{ color: color.ink }}>PostgreSQL decides:</strong> an exclusion constraint, proven by a two-writers race test
      </p>
    </AbsoluteFill>
  );
}
