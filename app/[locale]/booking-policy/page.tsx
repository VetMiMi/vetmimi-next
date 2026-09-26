import Link from "next/link";
import { C } from "@/lib/tokens";
import { WaveDivider } from "@/components/art/Shapes";

const sections = [
  {
    heading: "Appointment requests and confirmation",
    body: "Submitting a booking request does not confirm your appointment. You will receive a separate confirmation from Daw Mi once your request has been reviewed. [To confirm — turnaround time]",
  },
  {
    heading: "Rescheduling",
    body: "If you need to reschedule, please contact Daw Mi as early as possible. [To confirm — process and notice requirements]",
  },
  {
    heading: "Cancellation",
    body: "Cancellations must be made with sufficient notice. Please refer to the notice periods below. [To confirm]",
  },
  {
    heading: "Notice periods",
    body: "[To confirm — specific notice periods, e.g. 48 hours for individual sessions]",
  },
  {
    heading: "Late cancellation and fees",
    body: "[To confirm — late cancellation policy and any applicable fees]",
  },
  {
    heading: "No-shows",
    body: "If you do not attend a scheduled appointment without prior notice, [To confirm — no-show policy]",
  },
  {
    heading: "Payment",
    body: "[To confirm — payment methods, timing, and invoicing process]",
  },
  {
    heading: "Contact",
    body: "If you have a question about your booking, please contact Daw Mi using the contact form or at [To confirm — email].",
  },
];

export default function BookingPolicy() {
  return (
    <div style={{ backgroundColor: C.canvas, minHeight: "100dvh" }}>
      {/* Header */}
      <div style={{ padding: "7rem 0 4rem" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <Link
              href="/"
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.78rem",
                color: `${C.ink}66`,
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "inline-block",
                marginBottom: "1.5rem",
              }}
            >
              ← Home
            </Link>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(2rem,4vw,3rem)",
                color: C.ink,
                margin: "0 0 2rem",
                lineHeight: 1.15,
              }}
            >
              Booking &amp; Cancellation Policy
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem" }}>
          <WaveDivider from={C.canvas} to={C.paper} variant="gentle" />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 7rem" }}>
        {/* Placeholder notice */}
        <div
          style={{
            backgroundColor: C.paper,
            borderRadius: 8,
            padding: "1.25rem 1.5rem",
            marginBottom: "3rem",
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: `${C.ink}BB`,
            lineHeight: 1.7,
            borderLeft: `3px solid ${C.ochre}`,
          }}
        >
          This booking and cancellation policy is a placeholder pending formal
          review. All content is subject to change. Last updated [Date].
        </div>

        {sections.map((section) => (
          <div key={section.heading} style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.15rem,2vw,1.35rem)",
                color: C.ink,
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              {section.heading}
            </h2>
            <p
              style={{
                fontFamily: "var(--sans)",
                color: `${C.ink}BB`,
                lineHeight: 1.78,
                margin: 0,
                fontSize: "1rem",
              }}
            >
              {section.body}
            </p>
          </div>
        ))}

        {/* Footer links */}
        <div
          style={{
            borderTop: `1px solid ${C.ink}18`,
            paddingTop: "2.5rem",
            marginTop: "3rem",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
            }}
          >
            ← Return to home
          </Link>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: C.rose,
              textDecoration: "none",
            }}
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
