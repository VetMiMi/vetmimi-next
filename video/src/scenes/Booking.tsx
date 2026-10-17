import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Loop, Underline } from "../components/Brand";
import { BrowserFrame, PhoneFrame, phoneScreen, Screenshot } from "../components/Devices";
import { Kicker } from "../components/Kicker";
import { fadeOut, progress, rise } from "../motion";
import { color, font } from "../theme";

type Step = {
  title: string;
  detail: string;
  shot: string;
  scroll: [number, number];
  Accent?: () => ReactNode;
};

const steps: Step[] = [
  {
    title: "Choose a service",
    detail: "Individual art therapy, online, sixty minutes.",
    shot: "book-service.webp",
    scroll: [0, 160],
  },
  {
    title: "Pick a time",
    detail: "Only free times are offered, shown in Sydney time.",
    shot: "book-time.webp",
    scroll: [0, 330],
    Accent: TimeLoop,
  },
  {
    title: "Add your details",
    detail: "Name, email and an optional note.",
    shot: "book-details.webp",
    scroll: [0, 380],
  },
  {
    title: "Check and send",
    detail: "Every answer on one page, each one easy to edit.",
    shot: "book-review.webp",
    scroll: [0, 330],
  },
  {
    title: "Request sent",
    detail: "A reference straight away. Daw Mi confirms by email.",
    shot: "book-sent.webp",
    scroll: [0, 90],
    Accent: ReferenceUnderline,
  },
];

const stepFrames = 108;
const fadeFrames = 14;
const browserWidth = 1060;
const phoneScale = 0.6;

function TimeLoop() {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 370, top: 976, width: 140, height: 80 }}>
      <Loop draw={progress(frame, 72, 28)} weight={4} />
    </div>
  );
}

function ReferenceUnderline() {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 464, top: 526, width: 232, height: 28, fontSize: 28 }}>
      <Underline draw={progress(frame, 86, 30)} weight={4} />
    </div>
  );
}

function BrowserStep({ step, last }: { step: Step; last: boolean }) {
  const frame = useCurrentFrame();
  const y = interpolate(progress(frame, last ? 50 : 36, 34), [0, 1], step.scroll);
  return (
    <Screenshot file={step.shot} opacity={progress(frame, 0, fadeFrames)} sourceWidth={1440} viewWidth={browserWidth} y={y}>
      {step.Accent && <step.Accent />}
    </Screenshot>
  );
}

function PhoneScreens() {
  const frame = useCurrentFrame();
  const burmese = progress(frame, stepFrames, fadeFrames);
  const firstY = progress(frame, 40, 34) * 360;
  const secondY = progress(frame, stepFrames + 40, 34) * 720 + progress(frame, stepFrames * 2 + 40, 34) * 840;
  return (
    <>
      <Screenshot file="book-service-phone.webp" sourceWidth={780} viewWidth={phoneScreen.width} y={firstY} />
      <Screenshot file="book-time-phone-my.webp" opacity={burmese} sourceWidth={780} viewWidth={phoneScreen.width} y={secondY} />
    </>
  );
}

function Caption({ step, index }: { step: Step; index: number }) {
  const frame = useCurrentFrame();
  const fade = index === steps.length - 1 ? 1 : fadeOut(frame, stepFrames - 2, 12);
  return (
    <div style={{ opacity: fade }}>
      <Kicker style={{ fontSize: 18, color: color.muted, ...rise(frame, 2, 14) }}>
        {`STEP ${index + 1} OF ${steps.length}`}
      </Kicker>
      <p
        style={{
          margin: "22px 0 0",
          fontFamily: font.display,
          fontSize: 80,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: color.ink,
          ...rise(frame, 6),
        }}
      >
        {step.title}
      </p>
      <p style={{ margin: "26px 0 0", fontFamily: font.sans, fontSize: 30, lineHeight: 1.45, color: color.muted, ...rise(frame, 12) }}>
        {step.detail}
      </p>
    </div>
  );
}

export function Booking() {
  const frame = useCurrentFrame();
  const current = Math.min(steps.length - 1, Math.floor(frame / stepFrames));
  return (
    <AbsoluteFill
      style={{ flexDirection: "row", alignItems: "center", gap: 64, paddingLeft: 110, background: color.canvas }}
    >
      <div style={{ position: "relative", width: 470, height: 470 }}>
        <Kicker style={rise(frame, 2, 14)}>A VISITOR BOOKS</Kicker>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {steps.map((step, index) => (
            <span
              key={step.title}
              style={{ width: 56, height: 5, borderRadius: 3, background: index <= current ? color.coral : color.line }}
            />
          ))}
        </div>
        {steps.map((step, index) => (
          <Sequence
            durationInFrames={index === steps.length - 1 ? undefined : stepFrames}
            from={index * stepFrames}
            key={step.title}
            layout="none"
          >
            <div style={{ position: "absolute", inset: "110px 0 0" }}>
              <Caption index={index} step={step} />
            </div>
          </Sequence>
        ))}
      </div>
      <div style={{ position: "relative", ...rise(frame, 4, 40) }}>
        <BrowserFrame address="vetmimi.duckdns.org/book" width={browserWidth}>
          {steps.map((step, index) => (
            <Sequence from={index * stepFrames} key={step.title} layout="none">
              <BrowserStep last={index === steps.length - 1} step={step} />
            </Sequence>
          ))}
        </BrowserFrame>
        <div
          style={{
            position: "absolute",
            right: -130,
            bottom: -96,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ...rise(frame, 14, 60),
          }}
        >
          <div style={{ width: 460 * phoneScale, height: 969 * phoneScale }}>
            <div style={{ transform: `scale(${phoneScale})`, transformOrigin: "0 0" }}>
              <PhoneFrame>
                <PhoneScreens />
              </PhoneFrame>
            </div>
          </div>
          <p
            style={{
              margin: "16px 0 0",
              whiteSpace: "nowrap",
              fontFamily: font.sans,
              fontSize: 20,
              fontWeight: 600,
              color: color.muted,
              opacity: progress(frame, stepFrames + 10, 16),
            }}
          >
            The same steps on a phone, in မြန်မာ
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
}
