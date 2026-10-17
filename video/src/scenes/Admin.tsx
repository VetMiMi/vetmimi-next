import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Loop } from "../components/Brand";
import { BrowserFrame, Screenshot } from "../components/Devices";
import { Kicker } from "../components/Kicker";
import { progress, rise } from "../motion";
import { color, font } from "../theme";

const availabilityAt = 80;
const appointmentsAt = 290;
const dayOffAt = 226;
const browserWidth = 1160;

const pages = [
  { label: "Dashboard", address: "/admin", from: 0 },
  { label: "Availability", address: "/admin/availability", from: availabilityAt },
  { label: "Appointments", address: "/admin/appointments", from: appointmentsAt },
];

function Shot({ file, scroll, length }: { file: string; scroll: [number, number]; length: number }) {
  const frame = useCurrentFrame();
  const y = interpolate(progress(frame, 30, length), [0, 1], scroll);
  return <Screenshot file={file} opacity={progress(frame, 0, 14)} sourceWidth={1440} viewWidth={browserWidth} y={y} />;
}

function Availability() {
  const frame = useCurrentFrame();
  const y = interpolate(progress(frame, 50, 50), [0, 1], [0, 1900]);
  const dayOff = progress(frame, dayOffAt - availabilityAt, 14);
  return (
    <>
      <Screenshot file="admin-availability.webp" opacity={progress(frame, 0, 14)} sourceWidth={1440} viewWidth={browserWidth} y={y} />
      <Screenshot file="admin-availability-day-off.webp" opacity={dayOff} sourceWidth={1440} viewWidth={browserWidth} y={y}>
        <div style={{ position: "absolute", left: 498, top: 2532, width: 134, height: 118 }}>
          <Loop draw={progress(frame, dayOffAt - availabilityAt + 12, 30)} weight={4} />
        </div>
      </Screenshot>
    </>
  );
}

export function Admin() {
  const frame = useCurrentFrame();
  const current = pages.filter((page) => frame >= page.from).length - 1;
  return (
    <AbsoluteFill
      style={{ flexDirection: "row", alignItems: "center", gap: 70, paddingLeft: 110, background: color.canvas }}
    >
      <div style={{ width: 480 }}>
        <Kicker style={rise(frame, 2, 14)}>DAW MI’S ADMIN</Kicker>
        <p
          style={{
            margin: "24px 0 0",
            fontFamily: font.display,
            fontSize: 64,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: color.ink,
            ...rise(frame, 8),
          }}
        >
          Her hours, days off and bookings on one page.
        </p>
        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 20, ...rise(frame, 16) }}>
          {pages.map((page, index) => (
            <div
              key={page.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontFamily: font.sans,
                fontSize: 30,
                fontWeight: 600,
                color: index === current ? color.ink : color.muted,
                opacity: index === current ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: index === current ? color.coral : "transparent",
                  border: `2px solid ${index === current ? color.coral : color.line}`,
                }}
              />
              {page.label}
            </div>
          ))}
        </div>
      </div>
      <div style={rise(frame, 4, 40)}>
        <BrowserFrame address={`vetmimi.duckdns.org${pages[current].address}`} width={browserWidth}>
          <Shot file="admin-dashboard.webp" length={1} scroll={[0, 0]} />
          <Sequence from={availabilityAt} layout="none">
            <Availability />
          </Sequence>
          <Sequence from={appointmentsAt} layout="none">
            <Shot file="admin-appointments.webp" length={36} scroll={[0, 260]} />
          </Sequence>
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
}
