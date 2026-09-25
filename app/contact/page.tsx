"use client";
import { useState } from "react";
import Link from "next/link";
import { C } from "@/lib/tokens";
import { MintOpenCircle } from "@/components/art/Shapes";
import { Btn } from "@/components/ui/Button";

type ContactFormData = {
  name: string;
  email: string;
  organisation: string;
  enquiryType: string;
  subject: string;
  message: string;
  privacy: boolean;
};

type SubmitState = null | "success" | "failed";

const ENQUIRY_TYPES = [
  "Collaboration / Project",
  "Workshop / Program",
  "Speaking / Event",
  "Art of Wellness",
  "Media / Interview",
  "Organisation / Healthcare",
  "General",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: `1px solid ${C.ink}33`,
  borderRadius: 4,
  fontFamily: "var(--sans)",
  fontSize: "1rem",
  backgroundColor: "white",
  color: C.ink,
  boxSizing: "border-box" as const,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--sans)",
  fontSize: "0.88rem",
  fontWeight: 500,
  color: C.ink,
  marginBottom: "0.45rem",
};

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    organisation: "",
    enquiryType: "",
    subject: "",
    message: "",
    privacy: false,
  });
  const [submitState, setSubmitState] = useState<SubmitState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: nothing is sent yet. This delay fakes a submission and the
    // message is discarded. Wire up a Server Action or form service.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitState("success");
  };

  return (
    <div style={{ backgroundColor: C.canvas, minHeight: "100dvh" }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: "7rem 0 5rem", backgroundColor: C.canvas }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 2rem" }}>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: C.rose,
              marginBottom: "1.2rem",
            }}
          >
            Get in touch
          </p>
          <h1
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              fontFamily: "var(--serif)",
              color: C.ink,
              lineHeight: 1.1,
              maxWidth: 660,
            }}
          >
            Have something in mind?
          </h1>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────── */}
      <section style={{ padding: "0 0 8rem", backgroundColor: C.canvas }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 2rem" }}>
          <div
            style={{
              display: "grid",
              gap: "clamp(2rem, 5vw, 5rem)",
              alignItems: "start",
            }}
            className="grid-cols-1 md:grid-cols-2"
          >
            {/* ── Left: Form ───────────────────────────────── */}
            <div style={{ position: "relative" }}>
              {/* Booking redirect notice */}
              <div
                style={{
                  backgroundColor: C.paper,
                  borderLeft: `3px solid ${C.rose}`,
                  borderRadius: "0 6px 6px 0",
                  padding: "1.25rem 1.5rem",
                  marginBottom: "2.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.92rem",
                    color: C.ink,
                    lineHeight: 1.6,
                  }}
                >
                  To book an individual appointment, please use the booking
                  page.{" "}
                  <Link
                    href="/book"
                    style={{
                      color: C.rose,
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                    }}
                  >
                    Go to booking →
                  </Link>
                </p>
              </div>

              {/* Absolute mint circle */}
              <div
                style={{
                  position: "absolute",
                  left: "-5rem",
                  top: "8rem",
                  pointerEvents: "none",
                  opacity: 0.4,
                  zIndex: 0,
                }}
              >
                <MintOpenCircle size={260} />
              </div>

              {/* Success state S07 */}
              {submitState === "success" ? (
                <div
                  style={{
                    backgroundColor: C.paper,
                    borderRadius: 12,
                    padding: "3rem 2.5rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.6rem",
                      color: C.ink,
                      marginBottom: "0.75rem",
                      lineHeight: 1.3,
                    }}
                  >
                    Thank you. Your message has been sent.
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--sans)",
                      color: `${C.ink}BB`,
                      lineHeight: 1.78,
                      fontSize: "1rem",
                    }}
                  >
                    Daw Mi has received your enquiry.
                  </p>
                </div>
              ) : (
                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Error state S08 */}
                  {submitState === "failed" && (
                    <div
                      style={{
                        backgroundColor: `${C.red}11`,
                        border: `1px solid ${C.red}44`,
                        borderRadius: 8,
                        padding: "1.25rem 1.5rem",
                        marginBottom: "1.75rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--sans)",
                          fontSize: "0.92rem",
                          color: C.red,
                          lineHeight: 1.6,
                          marginBottom: "0.75rem",
                        }}
                      >
                        Something did not go through. Your message has not been
                        sent yet. Your information is still here, so you can try
                        again.
                      </p>
                      <button
                        onClick={() => setSubmitState(null)}
                        style={{
                          fontFamily: "var(--sans)",
                          fontSize: "0.85rem",
                          color: C.red,
                          background: "none",
                          border: `1px solid ${C.red}`,
                          borderRadius: 4,
                          padding: "0.4rem 0.9rem",
                          cursor: "pointer",
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column" as const,
                      gap: "1.5rem",
                    }}
                  >
                    {/* Name */}
                    <div>
                      <label htmlFor="name" style={labelStyle}>
                        Name <span style={{ color: C.rose }}>*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Your name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" style={labelStyle}>
                        Email <span style={{ color: C.rose }}>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Organisation */}
                    <div>
                      <label htmlFor="organisation" style={labelStyle}>
                        Organisation{" "}
                        <span style={{ color: `${C.ink}55`, fontWeight: 400 }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        id="organisation"
                        name="organisation"
                        type="text"
                        value={formData.organisation}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Organisation or institution"
                      />
                    </div>

                    {/* Enquiry type */}
                    <div>
                      <label htmlFor="enquiryType" style={labelStyle}>
                        Enquiry type
                      </label>
                      <select
                        id="enquiryType"
                        name="enquiryType"
                        value={formData.enquiryType}
                        onChange={handleChange}
                        style={{ ...inputStyle, appearance: "auto" as const }}
                      >
                        <option value="">Select an enquiry type</option>
                        {ENQUIRY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" style={labelStyle}>
                        Subject <span style={{ color: C.rose }}>*</span>
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Brief subject line"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" style={labelStyle}>
                        Message <span style={{ color: C.rose }}>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={7}
                        value={formData.message}
                        onChange={handleChange}
                        style={{
                          ...inputStyle,
                          resize: "vertical" as const,
                          lineHeight: 1.65,
                        }}
                        placeholder="Tell Daw Mi what you have in mind..."
                      />
                    </div>

                    {/* Privacy checkbox */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        required
                        checked={formData.privacy}
                        onChange={handleChange}
                        style={{
                          marginTop: "0.2rem",
                          accentColor: C.rose,
                          flexShrink: 0,
                        }}
                      />
                      <label
                        htmlFor="privacy"
                        style={{
                          ...labelStyle,
                          marginBottom: 0,
                          fontWeight: 400,
                          cursor: "pointer",
                        }}
                      >
                        I have read and agree to the{" "}
                        <Link
                          href="/privacy"
                          style={{
                            color: C.rose,
                            textDecoration: "underline",
                            textUnderlineOffset: 2,
                          }}
                        >
                          privacy policy
                        </Link>
                        <span style={{ color: C.rose }}> *</span>
                      </label>
                    </div>

                    {/* Guidance note */}
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.8rem",
                        color: `${C.ink}77`,
                        lineHeight: 1.65,
                        padding: "0.75rem 1rem",
                        backgroundColor: C.paper,
                        borderRadius: 4,
                      }}
                    >
                      Please do not include private medical or detailed health
                      information in this form.
                    </p>

                    <div>
                      <Btn
                        type="submit"
                        disabled={isSubmitting}
                        style={{ minWidth: 180 }}
                      >
                        {isSubmitting ? "Sending…" : "Send message"}
                      </Btn>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* ── Right: Supporting info ────────────────────── */}
            <div style={{ paddingTop: "1rem" }}>
              <div style={{ marginBottom: "3rem" }}>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    color: C.rose,
                    marginBottom: "1.2rem",
                  }}
                >
                  Contact details
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: C.ink,
                        marginBottom: "0.25rem",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Email
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        color: `${C.ink}BB`,
                        fontSize: "0.95rem",
                      }}
                    >
                      [To confirm]
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: C.ink,
                        marginBottom: "0.25rem",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Location
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        color: `${C.ink}BB`,
                        fontSize: "0.95rem",
                      }}
                    >
                      Sydney, NSW, Australia [To confirm]
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: C.ink,
                        marginBottom: "0.25rem",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Response time
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        color: `${C.ink}BB`,
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                      }}
                    >
                      [To confirm]
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr
                style={{
                  border: "none",
                  borderTop: `1px solid ${C.ink}18`,
                  marginBottom: "2rem",
                }}
              />

              <div>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    color: C.rose,
                    marginBottom: "1rem",
                  }}
                >
                  Good to know
                </p>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    color: `${C.ink}BB`,
                    lineHeight: 1.78,
                    fontSize: "0.95rem",
                    marginBottom: "1rem",
                  }}
                >
                  This contact form is for professional enquiries:
                  collaborations, workshops, speaking, and project
                  conversations.
                </p>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    color: `${C.ink}BB`,
                    lineHeight: 1.78,
                    fontSize: "0.95rem",
                  }}
                >
                  To book an individual appointment, please use the{" "}
                  <Link
                    href="/book"
                    style={{
                      color: C.rose,
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                    }}
                  >
                    booking page
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
