import Link from "next/link";
import { C } from "@/lib/tokens";
import { WaveDivider } from "@/components/art/Shapes";

const sections = [
  {
    heading: "General information",
    body: "This website provides general information about art therapy services offered by Daw Mi and her creative practice, Art of Wellness. It is intended for informational purposes only.",
  },
  {
    heading: "Not personalised advice",
    body: "Nothing on this website constitutes personalised therapeutic, medical, psychological, or clinical advice. Information presented here is general in nature.",
  },
  {
    heading: "Browsing does not create a therapeutic relationship",
    body: "Reading this website, submitting a contact or booking form, or communicating with Daw Mi through this website does not create a therapeutic relationship. A therapeutic relationship is only established through a formal agreement.",
  },
  {
    heading: "Scope of professional services",
    body: "Daw Mi provides art therapy and creative wellbeing services within the scope of her qualifications and professional registration. [To confirm — registration body and scope details]",
  },
  {
    heading: "No guaranteed outcomes",
    body: "Art therapy and creative wellbeing sessions may not be suitable for everyone. Outcomes vary between individuals and cannot be guaranteed.",
  },
  {
    heading: "Emergency and crisis situations",
    body: "This website is not a crisis service. If you are experiencing a mental health emergency, please contact emergency services (000 in Australia), Lifeline (13 11 14), or your nearest emergency department.",
  },
  {
    heading: "External links",
    body: "This website may contain links to external websites. We are not responsible for the content or privacy practices of those sites.",
  },
  {
    heading: "Contact",
    body: "If you have questions about the information on this website, please use the contact form.",
  },
];

export default function Disclaimer() {
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
              Important information about this website
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
          This disclaimer is a placeholder pending formal legal review. All
          content is subject to change. Last updated [Date].
        </div>

        {/* Emergency callout — always prominent */}
        <div
          style={{
            backgroundColor: `${C.coral}12`,
            border: `1px solid ${C.coral}44`,
            borderRadius: 8,
            padding: "1.25rem 1.5rem",
            marginBottom: "3rem",
            fontFamily: "var(--sans)",
            fontSize: "0.9rem",
            color: C.ink,
            lineHeight: 1.7,
          }}
        >
          <strong>If you are in crisis:</strong> Contact emergency services on{" "}
          <strong>000</strong>, Lifeline on <strong>13 11 14</strong>, or go to
          your nearest emergency department. This website is not a crisis
          service.
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
