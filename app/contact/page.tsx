"use client";
import { useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui/Button";
import "@/styles/contact.css";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    <div className="contact-page">
      {/* ── Hero: which page do I need? ─────────────────── */}
      <section className="contact-container contact-hero">
        <p className="contact-eyebrow">Get in touch</p>
        <h1>Have something in mind?</h1>
        <div className="contact-choices">
          <Link href="/book" className="contact-choice">
            <strong>Book a session</strong>
            <span>For individual art therapy appointments.</span>
            <em>Go to booking →</em>
          </Link>
          <a href="#enquiry" className="contact-choice">
            <strong>Send an enquiry</strong>
            <span>
              Groups, workshops, collaborations, speaking and project
              conversations.
            </span>
            <em>Use the form below ↓</em>
          </a>
        </div>
      </section>

      {/* ── Form + details ──────────────────────────────── */}
      <section id="enquiry" className="contact-container contact-main">
        <div className="contact-card">
          {submitState === "success" ? (
            <div className="contact-success" role="status">
              <h2>Thank you. Your message has been sent.</h2>
              <p>Daw Mi has received your enquiry.</p>
            </div>
          ) : (
            <>
              <h2>Send an enquiry</h2>

              {submitState === "failed" && (
                <div
                  className="contact-status contact-status--error"
                  role="alert"
                  style={{ marginBottom: 24 }}
                >
                  <p>
                    Something did not go through. Your message has not been sent
                    yet. Your information is still here, so you can try again.
                  </p>
                  <button type="button" onClick={() => setSubmitState(null)}>
                    Retry
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-row">
                  <div>
                    <label htmlFor="name" className="contact-label">
                      Name <span className="req">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="contact-input"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="contact-label">
                      Email <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="contact-input"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="organisation" className="contact-label">
                    Organisation <span className="opt">(optional)</span>
                  </label>
                  <input
                    id="organisation"
                    name="organisation"
                    type="text"
                    autoComplete="organization"
                    value={formData.organisation}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Organisation or institution"
                  />
                </div>

                <fieldset className="contact-pills">
                  <legend className="contact-label">Enquiry type</legend>
                  <div className="contact-pill-list">
                    {ENQUIRY_TYPES.map((type) => (
                      <label key={type} className="contact-pill">
                        <input
                          type="radio"
                          name="enquiryType"
                          value={type}
                          checked={formData.enquiryType === type}
                          onChange={handleChange}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="subject" className="contact-label">
                    Subject <span className="req">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Brief subject line"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="contact-label">
                    Message <span className="req">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={7}
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Tell Daw Mi what you have in mind..."
                  />
                </div>

                <label htmlFor="privacy" className="contact-privacy">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    checked={formData.privacy}
                    onChange={handleChange}
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link href="/privacy">privacy policy</Link>
                    <span className="req"> *</span>
                  </span>
                </label>

                <p className="contact-note">
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
            </>
          )}
        </div>

        <aside className="contact-details" aria-label="Contact details">
          <p className="contact-eyebrow">Contact details</p>
          <dl>
            <div>
              <dt>Email</dt>
              <dd>[To confirm]</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Sydney, NSW, Australia [To confirm]</dd>
            </div>
            <div>
              <dt>Response time</dt>
              <dd>[To confirm]</dd>
            </div>
          </dl>
          <hr />
          <p className="contact-details-note">
            Looking for an individual appointment? Please use the{" "}
            <Link href="/book">booking page</Link>.
          </p>
        </aside>
      </section>
    </div>
  );
}
