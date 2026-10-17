import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Kicker } from "../components/Kicker";
import { progress, rise } from "../motion";
import { color, font } from "../theme";

const layers = [
  { name: "Next.js", detail: "The site and the admin, in two languages", at: 24 },
  { name: "Go API", detail: "Booking, video sessions, content", at: 40 },
  { name: "PostgreSQL", detail: "Bookings and the rules that guard them", at: 56 },
  { name: "Redis", detail: "Emails, reminders, rate limits", at: 66 },
];

const facts = [
  { head: "90", detail: "API operations from one OpenAPI contract" },
  { head: "458", detail: "Go tests, run with -race" },
  { head: "Keyless deploys", detail: "GitHub OIDC → ECR → health check → automatic rollback" },
  { head: "Multi-AZ on AWS Fargate", detail: "201 of 201 requests during a rolling deploy" },
];
const firstFactAt = 110;
const factEvery = 48;

const box = {
  borderRadius: 20,
  border: "1px solid rgba(255,247,239,0.22)",
  background: "rgba(255,247,239,0.07)",
  padding: "22px 28px",
};

function Layer({ name, detail, at }: { name: string; detail: string; at: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...box, flex: 1, ...rise(frame, at, 20) }}>
      <p style={{ margin: 0, fontFamily: font.display, fontSize: 38, color: color.canvas }}>{name}</p>
      <p style={{ margin: "6px 0 0", fontFamily: font.sans, fontSize: 21, lineHeight: 1.35, color: color.aqua }}>{detail}</p>
    </div>
  );
}

function Joint({ at }: { at: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", height: 34 }}>
      <span style={{ width: 2, height: 34 * progress(frame, at, 12), background: "rgba(255,247,239,0.35)" }} />
    </div>
  );
}

export function UnderTheHood() {
  const frame = useCurrentFrame();
  const [web, api, postgres, redis] = layers;
  return (
    <AbsoluteFill style={{ padding: "96px 130px", background: color.indigo, fontFamily: font.sans }}>
      <Kicker style={{ color: color.butter, ...rise(frame, 2, 14) }}>UNDER THE HOOD</Kicker>
      <p
        style={{
          margin: "20px 0 0",
          fontFamily: font.display,
          fontSize: 68,
          letterSpacing: "-0.02em",
          color: color.canvas,
          ...rise(frame, 8),
        }}
      >
        Quiet on the surface, <em style={{ color: color.butter }}>careful underneath.</em>
      </p>
      <div style={{ display: "flex", gap: 90, marginTop: 64 }}>
        <div style={{ width: 600 }}>
          <Layer {...web} />
          <Joint at={api.at - 6} />
          <Layer {...api} />
          <Joint at={postgres.at - 6} />
          <div style={{ display: "flex", gap: 20 }}>
            <Layer {...postgres} />
            <Layer {...redis} />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {facts.map((fact, index) => (
            <div key={fact.head} style={{ ...box, ...rise(frame, firstFactAt + index * factEvery, 22) }}>
              <p style={{ margin: 0, fontFamily: font.display, fontSize: 40, lineHeight: 1.1, color: color.butter }}>{fact.head}</p>
              <p style={{ margin: "8px 0 0", fontSize: 26, lineHeight: 1.35, color: color.canvas }}>{fact.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
