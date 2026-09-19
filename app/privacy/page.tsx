import Link from "next/link";
import { C } from "@/lib/tokens"
import { WaveDivider } from "@/components/art/Shapes"

const sections = [
  {
    heading: "Information we collect",
    body: "When you use this website, we may collect information you provide directly, such as your name, email address, and any other details submitted through our contact or booking forms. We may also collect certain technical information automatically, such as your browser type, pages visited, and approximate location. [To confirm — full data inventory pending]",
  },
  {
    heading: "How we use your information",
    body: "Information you provide is used to respond to your enquiries, process appointment requests, and communicate with you about services. We do not use your information for unsolicited marketing. [To confirm]",
  },
  {
    heading: "Contact and booking forms",
    body: "When you submit a form on this website, the information is [To confirm — specify form processor/email service]. Please do not include private medical or detailed health information in any form on this website.",
  },
  {
    heading: "Booking information",
    body: "Information provided when making a booking request is used solely to manage and respond to your appointment request. [To confirm — specify retention and handling]",
  },
  {
    heading: "Third-party services",
    body: "This website may use third-party services for hosting, analytics, or form processing. [To confirm — list specific services and their privacy policies]",
  },
  {
    heading: "Data retention",
    body: "We retain your information for as long as necessary to fulfil the purpose for which it was collected, unless a longer retention period is required or permitted by law. [To confirm]",
  },
  {
    heading: "Access, correction and deletion",
    body: "You may request access to, correction of, or deletion of personal information we hold about you. To make a request, please contact us. [To confirm — add formal process]",
  },
  {
    heading: "Security",
    body: "We take reasonable steps to protect the information we hold. However, no method of transmission over the internet is completely secure. [To confirm]",
  },
  {
    heading: "Privacy contact",
    body: "For privacy-related enquiries, please contact us at [To confirm — email address]. Alternatively, use the contact form on this website.",
  },
]

export default function Privacy() {
  return (
    <div style={{ backgroundColor: C.canvas, minHeight: "100vh" }}>
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
              Privacy Policy
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
          This privacy policy is a placeholder pending formal legal review. All content is subject to change. Last updated [Date].
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
  )
}
